import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_MESSAGE_LENGTH = 500;
const COOLDOWN_MS = 5000;

async function getConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { listing: true },
  });

  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return null;
  }
  return conversation;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const conversation = await getConversation(params.conversationId, userId);
  if (!conversation) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: params.conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ conversation, messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const conversation = await getConversation(params.conversationId, userId);
  if (!conversation) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const text = (body?.body as string | undefined)?.trim() ?? "";

  if (!text) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` },
      { status: 400 }
    );
  }

  const lastMessage = await prisma.message.findFirst({
    where: { conversationId: params.conversationId, senderId: userId },
    orderBy: { createdAt: "desc" },
  });

  if (
    lastMessage &&
    Date.now() - new Date(lastMessage.createdAt).getTime() < COOLDOWN_MS
  ) {
    return NextResponse.json(
      { error: "Slow down before sending another message." },
      { status: 429 }
    );
  }

  const message = await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      senderId: userId,
      body: text,
    },
  });

  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: { lastMessageAt: message.createdAt },
  });

  const recipientId =
    conversation.buyerId === userId
      ? conversation.sellerId
      : conversation.buyerId;

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "MESSAGE",
      data: JSON.stringify({
        conversationId: conversation.id,
        listingId: conversation.listingId,
        messageId: message.id,
      }),
    },
  });

  return NextResponse.json({ message });
}
