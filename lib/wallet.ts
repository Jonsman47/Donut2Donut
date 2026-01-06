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
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: deltaPoints } },
    }),
    prisma.userWallet.update({
      where: { userId },
      data: {
        pointsBalance: { increment: deltaPoints },
        lifetimePointsEarned: deltaPoints > 0 ? { increment: deltaPoints } : undefined,
      },
    }),
    prisma.pointsLedger.create({
      data: {
        userId,
        source,
        deltaPoints,
        meta: meta ? JSON.stringify(meta) : undefined,
      },
    }),
  ]);
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
  await prisma.$transaction([
    prisma.userWallet.update({
      where: { userId },
      data: {
        creditBalanceCents: { increment: deltaCents },
      },
    }),
    prisma.creditLedger.create({
      data: {
        userId,
        source,
        deltaCents,
        meta: meta ? JSON.stringify(meta) : undefined,
      },
    }),
  ]);
}
