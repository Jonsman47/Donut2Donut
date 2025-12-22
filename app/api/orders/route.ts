import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateSafeTradeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "D2D-";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const buyerId = session.user.id as string;

  const body = await req.json().catch(() => null);
  if (!body || !body.listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1;

  const listing = await prisma.listing.findUnique({
    where: { id: body.listingId },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.sellerId === buyerId) {
    return NextResponse.json(
      { error: "Tu ne peux pas acheter ta propre annonce." },
      { status: 400 }
    );
  }

  const unitPriceCents = listing.priceCents;
  const subtotalCents = unitPriceCents * quantity;
  const platformFeeCents = Math.round(subtotalCents * 0.1);
  const totalCents = subtotalCents + platformFeeCents;

  const safeTradeCode = generateSafeTradeCode();
  const buyerDisputeDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const order = await prisma.order.create({
    data: {
      buyerId,
      sellerId: listing.sellerId,
      listingId: listing.id,
      quantity,
      unitPriceCents,
      subtotalCents,
      platformFeeCents,
      totalCents,
      status: "PENDING",
      safeTradeCode,
      buyerDisputeDeadline,
    },
  });

  await prisma.notification.create({
    data: {
      userId: listing.sellerId,
      type: "ORDER_STATUS",
      data: {
        orderId: order.id,
        status: order.status,
      },
    },
  });

  await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: {
        listingId: listing.id,
        buyerId,
        sellerId: listing.sellerId,
      },
    },
    create: {
      listingId: listing.id,
      buyerId,
      sellerId: listing.sellerId,
      lastMessageAt: new Date(),
    },
    update: {},
  });

  return NextResponse.json({ order });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const url = new URL(req.url);
  const role = url.searchParams.get("role") || "buyer";

  const where =
    role === "seller" ? { sellerId: userId } : { buyerId: userId };

  const orders = await prisma.order.findMany({
    where,
    include: {
      listing: { include: { images: true } },
      buyer: true,
      seller: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const conversationKeys = orders.map((order) => ({
    listingId: order.listingId,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
  }));

  const conversations = conversationKeys.length
    ? await prisma.conversation.findMany({
        where: {
          OR: conversationKeys.map((key) => ({
            listingId: key.listingId,
            buyerId: key.buyerId,
            sellerId: key.sellerId,
          })),
        },
      })
    : [];

  const conversationByKey = new Map(
    conversations.map((conv) => [
      `${conv.listingId ?? "none"}:${conv.buyerId}:${conv.sellerId}`,
      conv,
    ])
  );

  const conversationIds = conversations.map((conv) => conv.id);
  const unreadMessages = conversationIds.length
    ? await prisma.message.findMany({
        where: {
          conversationId: { in: conversationIds },
          readAt: null,
          NOT: { senderId: userId },
        },
        select: { conversationId: true },
      })
    : [];

  const unreadCounts = unreadMessages.reduce<Record<string, number>>(
    (acc, msg) => {
      acc[msg.conversationId] = (acc[msg.conversationId] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const payload = orders.map((order) => {
    const key = `${order.listingId}:${order.buyerId}:${order.sellerId}`;
    const conversation = conversationByKey.get(key);
    return {
      ...order,
      conversationId: conversation?.id ?? null,
      unreadMessages: conversation
        ? unreadCounts[conversation.id] ?? 0
        : 0,
    };
  });

  return NextResponse.json({ orders: payload });
}
