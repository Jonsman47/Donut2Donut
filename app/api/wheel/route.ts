import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addPoints, getOrCreateWallet } from "@/lib/wallet";
import { createNotification } from "@/lib/notifications";

const REWARDS = [
  { type: "points", value: 1, weight: 50 },
  { type: "points", value: 3, weight: 25 },
  { type: "points", value: 5, weight: 10 },
  { type: "points", value: 10, weight: 5 },
  { type: "discount", value: 10, weight: 3.33 },
  { type: "points", value: 25, weight: 3.33 },
  { type: "lifetime_discount", value: 0.1, weight: 3.33 },
  { type: "points", value: 250, weight: 0.01 },
];

function pickReward() {
  const total = REWARDS.reduce((sum, reward) => sum + reward.weight, 0);
  const roll = Math.random() * total;
  let cumulative = 0;
  for (const reward of REWARDS) {
    cumulative += reward.weight;
    if (roll <= cumulative) return reward;
  }
  return REWARDS[0];
}

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const dayKey = getDayKey();

  const latestSpin = await prisma.wheelSpin.findFirst({
    where: { userId, dayKey },
  });

  return NextResponse.json({
    canSpin: !latestSpin,
    lastSpinAt: latestSpin?.spunAt ?? null,
    dayKey,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const dayKey = getDayKey();

  const existing = await prisma.wheelSpin.findUnique({
    where: { userId_dayKey: { userId, dayKey } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already spun today" }, { status: 400 });
  }

  const reward = pickReward();
  await getOrCreateWallet(userId);

  const spin = await prisma.wheelSpin.create({
    data: {
      userId,
      rewardType: reward.type,
      rewardValue: String(reward.value),
      dayKey,
    },
  });

  if (reward.type === "points") {
    await addPoints({
      userId,
      deltaPoints: reward.value,
      source: "wheel",
      meta: { spinId: spin.id },
    });

    await createNotification({
      userId,
      type: "system",
      title: "Wheel reward",
      body: `You won +${reward.value} points!`,
      linkUrl: "/wheel",
      metadata: { spinId: spin.id },
    });
  }

  if (reward.type === "discount") {
    await prisma.userCoupon.create({
      data: {
        userId,
        type: "percent_off_one_item",
        valuePercent: reward.value,
      },
    });

    await createNotification({
      userId,
      type: "system",
      title: "Wheel reward",
      body: "You won a 10% one-time discount.",
      linkUrl: "/wallet",
      metadata: { spinId: spin.id },
    });
  }

  if (reward.type === "lifetime_discount") {
    await prisma.userWallet.update({
      where: { userId },
      data: {
        lifetimeDiscountBps: { increment: 1 },
      },
    });

    await createNotification({
      userId,
      type: "system",
      title: "Wheel reward",
      body: "You earned a 0.1% lifetime discount.",
      linkUrl: "/wallet",
      metadata: { spinId: spin.id },
    });
  }

  return NextResponse.json({ spin, reward });
}
