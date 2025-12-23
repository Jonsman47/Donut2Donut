import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const orderId = params.id;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const messages = await prisma.tradeMessage.findMany({
        where: { orderId },
        include: {
            sender: {
                select: { id: true, username: true, image: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
}

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

    if (!body || !body.content || typeof body.content !== "string") {
        return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const content = body.content.trim();
    if (content.length === 0 || content.length > 500) {
        return NextResponse.json(
            { error: "Message must be between 1 and 500 characters" },
            { status: 400 }
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const message = await prisma.tradeMessage.create({
        data: {
            orderId,
            senderId: userId,
            content,
        },
        include: {
            sender: {
                select: { id: true, username: true, image: true },
            },
        },
    });

    const notifyTarget = order.buyerId === userId ? order.sellerId : order.buyerId;
    await createNotification({
        userId: notifyTarget,
        type: "message",
        title: "New message",
        body: content.slice(0, 120),
        linkUrl: `/market/orders/${order.id}`,
        metadata: { orderId: order.id, messageId: message.id },
    });

    return NextResponse.json({ message });
}
