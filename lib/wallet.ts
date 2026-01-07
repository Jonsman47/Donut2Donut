import { prisma } from "@/lib/prisma";

export async function getOrCreateWallet(userId: string) {
  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (wallet) return wallet;

  return prisma.userWallet.create({
    data: { userId },
  });
}

export async function addPoints({
  userId,
  deltaPoints,
  source,
  meta,
}: {
  userId: string;
  deltaPoints: number;
  source: string;
  meta?: Record<string, any>;
}) {
  await getOrCreateWallet(userId);
  await prisma.$transaction(async (tx) => {
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
        source,
        deltaPoints,
        meta: meta ? JSON.stringify(meta) : undefined,
      },
    });
  });
}

export async function addCredit({
  userId,
  deltaCents,
  source,
  meta,
}: {
  userId: string;
  deltaCents: number;
  source: string;
  meta?: Record<string, any>;
}) {
  await getOrCreateWallet(userId);
  await prisma.$transaction(async (tx) => {
    await tx.userWallet.update({
      where: { userId },
      data: {
        creditBalanceCents: { increment: deltaCents },
      },
    });
    await tx.creditLedger.create({
      data: {
        userId,
        source,
        deltaCents,
        meta: meta ? JSON.stringify(meta) : undefined,
      },
    });
  });
}
