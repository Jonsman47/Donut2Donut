import { prisma } from "@/lib/prisma";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRAL_CODE_LENGTH = 8;
const REFERRAL_SIGNUP_POINTS = 10;

async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
      code += REFERRAL_ALPHABET[Math.floor(Math.random() * REFERRAL_ALPHABET.length)];
    }
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  // Fallback to cuid if we somehow collide too many times
  return `REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export async function ensureReferralCodeForUser(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  const code = await generateUniqueReferralCode();
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });
  return code;
}

export async function applyReferralCodeForUser(userId: string, codeRaw: string) {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { status: "invalid_code" as const };

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
  });

  if (!referrer) return { status: "invalid_code" as const };
  if (referrer.id === userId) return { status: "self_referral" as const };

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { referredByUserId: true },
    });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    if (user.referredByUserId) {
      return {
        status: "already_referred" as const,
        referrerId: user.referredByUserId,
      };
    }

    const updated = await tx.user.updateMany({
      where: { id: userId, referredByUserId: null },
      data: { referredByUserId: referrer.id },
    });

    if (updated.count === 0) {
      const refreshed = await tx.user.findUnique({
        where: { id: userId },
        select: { referredByUserId: true },
      });
      return {
        status: "already_referred" as const,
        referrerId: refreshed?.referredByUserId,
      };
    }

    await tx.user.update({
      where: { id: referrer.id },
      data: { points: { increment: REFERRAL_SIGNUP_POINTS } },
    });

    await tx.userWallet.upsert({
      where: { userId: referrer.id },
      create: {
        userId: referrer.id,
        pointsBalance: REFERRAL_SIGNUP_POINTS,
        lifetimePointsEarned: REFERRAL_SIGNUP_POINTS,
      },
      update: {
        pointsBalance: { increment: REFERRAL_SIGNUP_POINTS },
        lifetimePointsEarned: { increment: REFERRAL_SIGNUP_POINTS },
      },
    });

    await tx.pointsLedger.create({
      data: {
        userId: referrer.id,
        source: "referral_signup",
        deltaPoints: REFERRAL_SIGNUP_POINTS,
        meta: JSON.stringify({ referredUserId: userId }),
      },
    });

    return {
      status: "applied" as const,
      referrerId: referrer.id,
    };
  });

  return result;
}
