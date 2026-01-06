import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyReferralCodeForUser, ensureReferralCodeForUser } from "@/lib/referrals";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      referralCode: true,
      referredByUserId: true,
      vipStatus: true,
      vipActiveUntil: true,
      vipLifetime: true,
    },
  });

  if (!userRecord) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const referralCode = userRecord.referralCode
    ? userRecord.referralCode
    : await ensureReferralCodeForUser(user.id);

  const referralLink = `${getBaseUrl()}/login?ref=${referralCode}`;

  return NextResponse.json({
    referralCode,
    referralLink,
    referredByUserId: userRecord.referredByUserId,
    vipStatus: userRecord.vipStatus,
    vipActiveUntil: userRecord.vipActiveUntil,
    vipLifetime: userRecord.vipLifetime,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code = (body?.code as string | undefined)?.trim();
  if (!code) {
    return NextResponse.json({ error: "Missing referral code" }, { status: 400 });
  }

  const result = await applyReferralCodeForUser(user.id, code);
  if (result.status === "invalid_code") {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }
  if (result.status === "self_referral") {
    return NextResponse.json({ error: "You cannot refer yourself" }, { status: 400 });
  }
  if (result.status === "already_referred") {
    return NextResponse.json(
      { error: "Referral already applied", referrerId: result.referrerId },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    referrerId: result.referrerId,
  });
}
