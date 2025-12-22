import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  await prisma.message.updateMany({
    where: {
      conversationId: params.conversationId,
      readAt: null,
      NOT: { senderId: userId },
    },
    data: { readAt: now },
  });

  return NextResponse.json({ ok: true });
}
