import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string } | undefined;
    if (!user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id as string;
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

    // Allow dispute if paid or delivered
    if (!["PAID_ESCROW", "DELIVERED", "COMPLETED"].includes(order.status)) {
        // Maybe allow dispute even if completed?
    }

    const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: "DISPUTE_OPEN" },
    });

    await prisma.dispute.create({
        data: {
            orderId,
            openedById: userId,
            status: "OPEN",
            whatPromised: "Dispute opened via Trade Room",
            whatReceived: "Pending review",
        }
    })

    await createNotification({
        userId: order.buyerId === userId ? order.sellerId : order.buyerId,
        type: "order",
        title: "Dispute opened",
        body: "A dispute was opened on this order.",
        linkUrl: `/market/orders/${order.id}`,
        metadata: { orderId: order.id, status: updated.status, action: "DISPUTE_OPENED" },
    });

    return NextResponse.json({ order: updated });
}
