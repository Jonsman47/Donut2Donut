import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const orderId = params.id;

    let order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            listing: { include: { images: true } },
            buyer: { select: { id: true, username: true, image: true } },
            seller: { select: { id: true, username: true, image: true } },
            deliveryProofs: {
                include: {
                    reviewedBy: { select: { id: true, username: true } },
                },
            },
        },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Auto-cancel if 24h passed without action
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeStatuses = ["REQUESTED", "ACCEPTED", "AWAITING_PAYMENT", "PAID_ESCROW", "DELIVERED"];

    if (activeStatuses.includes(order.status) && order.updatedAt < oneDayAgo) {
        order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "CANCELLED",
                // Log reason if needed
            },
            include: {
                listing: { include: { images: true } },
                buyer: { select: { id: true, username: true, image: true } },
                seller: { select: { id: true, username: true, image: true } },
                deliveryProofs: {
                    include: {
                        reviewedBy: { select: { id: true, username: true } },
                    },
                },
            },
        });
    }

    // Only buyer or seller (or admin) can view
    if (order.buyerId !== userId && order.sellerId !== userId && (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ order });
}
