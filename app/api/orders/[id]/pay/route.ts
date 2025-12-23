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

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const orderId = params.id;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== userId) {
        return NextResponse.json(
            { error: "Only the buyer can pay." },
            { status: 403 }
        );
    }

    if (order.status !== "ACCEPTED") {
        return NextResponse.json(
            { error: "Order is not ready for payment." },
            { status: 400 }
        );
    }

    // TODO: Integrate actual Payment Gateway (Stripe, PayPal, etc.)
    // For now, we simulate success.

    const safeTradeCode = generateSafeTradeCode();
    const buyerDisputeDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h from now

    const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: "PAID_ESCROW",
            safeTradeCode,
            buyerDisputeDeadline,
            escrowFundedAt: new Date(),
        },
    });

    await prisma.notification.create({
        data: {
            userId: order.sellerId,
            type: "ORDER_STATUS",
            data: JSON.stringify({
                orderId: order.id,
                status: updated.status,
            }),
        },
    });

    return NextResponse.json({ order: updated });
}
