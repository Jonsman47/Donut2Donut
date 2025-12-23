import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { refreshSellerStats } from "@/lib/seller-stats";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const orderId = params.id;
  const body = await req.json().catch(() => null);
  const proofId = body?.proofId as string | undefined;

  if (!proofId) {
    return NextResponse.json({ error: "Missing proofId" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.buyerId !== userId) {
    return NextResponse.json({ error: "Only the buyer can accept proof" }, { status: 403 });
  }

  const proof = await prisma.deliveryProof.findUnique({
    where: { id: proofId },
  });

  if (!proof || proof.orderId !== orderId) {
    return NextResponse.json({ error: "Proof not found" }, { status: 404 });
  }

  const updated = await prisma.deliveryProof.update({
    where: { id: proofId },
    data: {
      status: "ACCEPTED",
      reviewedAt: new Date(),
      reviewedById: userId,
    },
  });

  await Promise.all([
    createNotification({
      userId: order.sellerId,
      type: "order",
      title: "Proof accepted",
      body: "Your delivery proof was accepted.",
      linkUrl: `/market/orders/${order.id}`,
      metadata: { orderId: order.id, proofId: updated.id },
    }),
    refreshSellerStats(order.sellerId),
  ]);

  return NextResponse.json({ proof: updated });
}
