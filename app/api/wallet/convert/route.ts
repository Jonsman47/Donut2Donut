import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const points = Number(body?.points ?? 0);
  if (!points || points <= 0 || points % 100 !== 0) {
    return NextResponse.json({ error: "Points must be a positive multiple of 100" }, { status: 400 });
  }

  const userId = user.id as string;
  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (!wallet || wallet.pointsBalance < points) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }

  const creditCents = points; // 100 points = $1 => cents

  await prisma.$transaction([
    prisma.userWallet.update({
      where: { userId },
      data: {
        pointsBalance: { decrement: points },
        creditBalanceCents: { increment: creditCents },
      },
    }),
    prisma.pointsLedger.create({
      data: {
        userId,
        source: "convert",
        deltaPoints: -points,
        meta: JSON.stringify({ creditCents }),
      },
    }),
    prisma.creditLedger.create({
      data: {
        userId,
        source: "convert",
        deltaCents: creditCents,
        meta: JSON.stringify({ points }),
      },
    }),
  ]);

  await createNotification({
    userId,
    type: "system",
    title: "Points converted",
    body: `Converted ${points} points into $${(creditCents / 100).toFixed(2)} credit.`,
    linkUrl: "/wallet",
    metadata: { points, creditCents },
  });

  return NextResponse.json({ points, creditCents });
}
