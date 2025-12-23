import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Allow seller to decline, or buyer to cancel
    if (order.sellerId !== userId && order.buyerId !== userId) {
        return NextResponse.json(
            { error: "Access denied." },
            { status: 403 }
        );
    }

    if (order.status !== "REQUESTED") {
        return NextResponse.json(
            { error: "Order is not in REQUESTED state." },
            { status: 400 }
        );
    }

    const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
    });

    // Notify the other party
    const notifyTarget = order.sellerId === userId ? order.buyerId : order.sellerId;
    await prisma.notification.create({
        data: {
            userId: notifyTarget,
            type: "ORDER_STATUS",
            data: JSON.stringify({
                orderId: order.id,
                status: updated.status,
            }),
        },
    });

    return NextResponse.json({ order: updated });
}
