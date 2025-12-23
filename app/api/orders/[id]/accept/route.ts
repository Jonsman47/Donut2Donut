import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getVerificationStatus } from "@/lib/verification";

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

    if (order.sellerId !== userId) {
        return NextResponse.json(
            { error: "Only the seller can accept." },
            { status: 403 }
        );
    }

    const verification = await getVerificationStatus(userId);
    if (!verification?.setupComplete) {
        return NextResponse.json(
            { error: "Finish setup before selling", link: "/verify" },
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
        data: { status: "ACCEPTED" },
        include: { listing: true },
    });

    // If listing is ONE_TIME, deactivate it now
    if ((updated.listing as any).listingType === "ONE_TIME") {
        await prisma.listing.update({
            where: { id: updated.listingId },
            data: { active: false },
        });
        console.log(`[ACCEPT] ONE_TIME listing ${updated.listingId} deactivated for order ${orderId}`);
    }

    await createNotification({
        userId: order.buyerId,
        type: "order",
        title: "Order accepted",
        body: `Your order for ${updated.listing.title} was accepted.`,
        linkUrl: `/market/orders/${order.id}`,
        metadata: { orderId: order.id, status: updated.status },
    });

    return NextResponse.json({ order: updated });
}
