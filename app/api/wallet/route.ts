import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/wallet";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id as string;
  const wallet = await getOrCreateWallet(userId);
  const coupons = await prisma.userCoupon.findMany({
    where: { userId, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ wallet, coupons });
}
