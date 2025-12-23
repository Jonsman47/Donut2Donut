import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // Get user balance
  const user = await (prisma.user as any).findUnique({
    where: { id: userId },
    select: { balanceCents: true }
  });
  // Seller: Action needed for REQUESTED or (PAID_ESCROW/DELIVERED and haven't confirmed yet)
  const pendingSales = await (prisma.order as any).count({
    where: {
      sellerId: userId,
      OR: [
        { status: "REQUESTED" },
        { status: "ACCEPTED" }, // Seller needs to wait for payment or deliver
        {
          status: { in: ["PAID_ESCROW", "DELIVERED"] },
          sellerConfirmedAt: null
        }
      ]
    },
  });

  // Buyer: Action needed for ACCEPTED (to pay) or (PAID_ESCROW/DELIVERED and haven't confirmed yet)
  const activeOrders = await (prisma.order as any).count({
    where: {
      buyerId: userId,
      OR: [
        { status: { in: ["ACCEPTED", "AWAITING_PAYMENT"] } },
        {
          status: { in: ["PAID_ESCROW", "DELIVERED"] },
          buyerConfirmedAt: null
        }
      ]
    },
  });

  console.log(`[UNREAD] User ${userId}: Sales=${pendingSales}, Orders=${activeOrders}, Balance=${user?.balanceCents}`);

  return NextResponse.json({
    pendingSales,
    activeOrders,
    balanceCents: (user as any)?.balanceCents ?? 0
  });
}
