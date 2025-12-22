import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    select: { id: true },
  });

  const unreadMessages = conversations.length
    ? await prisma.message.count({
        where: {
          conversationId: { in: conversations.map((conv) => conv.id) },
          readAt: null,
          NOT: { senderId: userId },
        },
      })
    : 0;

  const pendingSales = await prisma.order.count({
    where: { sellerId: userId, status: "PENDING" },
  });

  const activeOrders = await prisma.order.count({
    where: {
      buyerId: userId,
      status: { in: ["PENDING", "ACCEPTED", "PAID", "SHIPPED", "DELIVERED"] },
    },
  });

  return NextResponse.json({
    unreadMessages,
    pendingSales,
    activeOrders,
  });
}
