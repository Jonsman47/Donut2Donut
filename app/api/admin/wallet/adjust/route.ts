import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const role = user.role ?? "";
  if (!role || !["ADMIN", "MOD"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const deltaPoints = Number(body?.deltaPoints ?? 0);
  const deltaCents = Number(body?.deltaCents ?? 0);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await getOrCreateWallet(userId);

  if (!deltaPoints && !deltaCents) {
    return NextResponse.json({ error: "No adjustments provided" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (deltaPoints) {
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: deltaPoints } },
      });
      await tx.userWallet.update({
        where: { userId },
        data: {
          pointsBalance: { increment: deltaPoints },
          lifetimePointsEarned: deltaPoints > 0 ? { increment: deltaPoints } : undefined,
        },
      });
      await tx.pointsLedger.create({
        data: {
          userId,
          source: "admin",
          deltaPoints,
          meta: JSON.stringify({ adminId: user.id }),
        },
      });
    }

    if (deltaCents) {
      await tx.userWallet.update({
        where: { userId },
        data: {
          creditBalanceCents: { increment: deltaCents },
        },
      });
      await tx.creditLedger.create({
        data: {
          userId,
          source: "admin",
          deltaCents,
          meta: JSON.stringify({ adminId: user.id }),
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
