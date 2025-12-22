import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { include: { images: true } },
      buyer: true,
      seller: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId: { in: conversations.map((conv) => conv.id) },
      readAt: null,
      NOT: { senderId: userId },
    },
    select: { conversationId: true },
  });

  const unreadCounts = unreadMessages.reduce<Record<string, number>>(
    (acc, msg) => {
      acc[msg.conversationId] = (acc[msg.conversationId] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const payload = conversations.map((conv) => ({
    ...conv,
    unreadMessages: unreadCounts[conv.id] ?? 0,
  }));

  return NextResponse.json({ conversations: payload });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const buyerId = session.user.id as string;
  const body = await req.json().catch(() => null);
  const listingId = body?.listingId as string | undefined;

  if (!listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.sellerId === buyerId) {
    return NextResponse.json(
      { error: "You cannot message yourself" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.upsert({
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
    },
    update: {},
  });

  return NextResponse.json({ conversation });
}
