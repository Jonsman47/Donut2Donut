import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isSellerAction(action: string) {
  return ["ACCEPT", "DECLINE", "SHIP", "DELIVER", "CANCEL"].includes(action);
}

function isBuyerAction(action: string) {
  return ["CANCEL", "COMPLETE", "DISPUTE"].includes(action);
}

function getNextStatus(params: {
  action: string;
  role: "buyer" | "seller";
  status: string;
  deliveryType: string;
}): string | null {
  const { action, role, status, deliveryType } = params;

  if (role === "seller") {
    if (action === "ACCEPT" && status === "PENDING") return "ACCEPTED";
    if (action === "DECLINE" && status === "PENDING") return "DECLINED";
    if (action === "CANCEL" && ["PENDING", "ACCEPTED"].includes(status)) {
      return "CANCELLED";
    }
    if (
      action === "SHIP" &&
      ["ACCEPTED", "PAID"].includes(status) &&
      deliveryType !== "SERVICE"
    ) {
      return "SHIPPED";
    }
    if (
      action === "DELIVER" &&
      ["ACCEPTED", "PAID"].includes(status) &&
      deliveryType === "SERVICE"
    ) {
      return "DELIVERED";
    }
  }

  if (role === "buyer") {
    if (action === "CANCEL" && status === "PENDING") return "CANCELLED";
    if (
      action === "COMPLETE" &&
      ["SHIPPED", "DELIVERED"].includes(status)
    ) {
      return "COMPLETED";
    }
    if (
      action === "DISPUTE" &&
      ["ACCEPTED", "PAID", "SHIPPED", "DELIVERED"].includes(status)
    ) {
      return "DISPUTE";
    }
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      listing: { include: { images: true } },
      buyer: true,
      seller: true,
      review: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.buyerId !== userId && order.sellerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      listingId_buyerId_sellerId: {
        listingId: order.listingId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
      },
    },
  });

  return NextResponse.json({
    order,
    conversationId: conversation?.id ?? null,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (!action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { listing: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const role = order.sellerId === userId ? "seller" : order.buyerId === userId ? "buyer" : null;

  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role === "seller" && !isSellerAction(action)) {
    return NextResponse.json({ error: "Invalid seller action" }, { status: 400 });
  }
  if (role === "buyer" && !isBuyerAction(action)) {
    return NextResponse.json({ error: "Invalid buyer action" }, { status: 400 });
  }

  const nextStatus = getNextStatus({
    action,
    role,
    status: order.status,
    deliveryType: order.listing.deliveryType,
  });

  if (!nextStatus) {
    return NextResponse.json({ error: "Status change not allowed" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: nextStatus },
  });

  const recipientId = role === "seller" ? order.buyerId : order.sellerId;
  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "ORDER_STATUS",
      data: JSON.stringify({
        orderId: order.id,
        status: nextStatus,
      }),
    },
  });

  return NextResponse.json({ order: updated });
}
