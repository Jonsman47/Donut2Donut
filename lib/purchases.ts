import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type BuyerSnapshot = {
  referredByUserId?: string | null;
  vipLifetime?: boolean | null;
  vipActiveUntil?: Date | null;
  vipStatus?: string | null;
};

export type PurchaseSplit = {
  ownerCutCents: number;
  referrerCutCents: number;
  referrerUserId: string | null;
  vipApplied: boolean;
  platformFeeCents: number;
};

export function isVipActive(user: BuyerSnapshot): boolean {
  if (user.vipLifetime) return true;
  if ((user.vipStatus ?? "").toLowerCase() === "lifetime") return true;
  if (user.vipActiveUntil) {
    return new Date(user.vipActiveUntil).getTime() > Date.now();
  }
  return false;
}

export function calculatePurchaseSplit(amountCents: number, buyer: BuyerSnapshot): PurchaseSplit {
  const hasReferrer = Boolean(buyer.referredByUserId);
  let ownerRate = hasReferrer ? 0.07 : 0.1;
  const referrerRate = hasReferrer ? 0.03 : 0;
  const vip = isVipActive(buyer);

  if (vip) {
    ownerRate = ownerRate / 2;
  }

  const ownerCutCents = Math.round(amountCents * ownerRate);
  const referrerCutCents = Math.round(amountCents * referrerRate);

  return {
    ownerCutCents,
    referrerCutCents,
    referrerUserId: hasReferrer ? (buyer.referredByUserId as string) : null,
    vipApplied: vip,
    platformFeeCents: ownerCutCents + referrerCutCents,
  };
}

export async function createPurchaseWithLedgers(params: {
  userId: string;
  amountCents: number;
  currency: string;
  split: PurchaseSplit;
  tx?: PrismaClient | Prisma.TransactionClient;
}) {
  const { userId, amountCents, currency, split, tx } = params;
  const client = tx ?? prisma;
  return client.purchase.create({
    data: {
      userId,
      amountCents,
      currency,
      ownerCutAmount: split.ownerCutCents,
      referrerUserId: split.referrerUserId,
      referrerCutAmount: split.referrerCutCents,
      vipApplied: split.vipApplied,
      payoutLedgers: {
        create: [
          ...(split.ownerCutCents > 0
            ? [
                {
                  role: "OWNER",
                  amountCents: split.ownerCutCents,
                  currency,
                },
              ]
            : []),
          ...(split.referrerCutCents > 0 && split.referrerUserId
            ? [
                {
                  role: "REFERRER",
                  amountCents: split.referrerCutCents,
                  currency,
                  userId: split.referrerUserId,
                },
              ]
            : []),
        ],
      },
    },
  });
}
