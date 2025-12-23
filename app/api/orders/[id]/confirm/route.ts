import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { refreshSellerStats } from "@/lib/seller-stats";
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

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                listing: true,
                deliveryProofs: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const ALLOWED_STATUSES = ["PAID_ESCROW", "DELIVERED"];
        if (!ALLOWED_STATUSES.includes(order.status)) {
            return NextResponse.json({ error: "Order not in valid state for confirmation" }, { status: 400 });
        }

        // Check if user has uploaded proof (required for seller)
        if (order.sellerId === userId) {
            const userProofs = (order as any).deliveryProofs?.filter((p: any) => p.userId === userId) || [];
            if (userProofs.length === 0) {
                console.log(`[CONFIRM] Seller ${userId} missing proof for order ${orderId}`);
                return NextResponse.json(
                    { error: "You must upload video proof before confirming" },
                    { status: 400 }
                );
            }
        }

        let dataToUpdate: any = {};

        if (order.buyerId === userId) {
            dataToUpdate.buyerConfirmedAt = new Date();
        } else if (order.sellerId === userId) {
            const verification = await getVerificationStatus(userId);
            if (!verification?.setupComplete) {
                return NextResponse.json(
                    { error: "Finish setup before selling", link: "/verify" },
                    { status: 403 }
                );
            }
            dataToUpdate.sellerConfirmedAt = new Date();
        } else {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Check if the OTHER party has already confirmed
        const buyerConfirmed = order.buyerId === userId ? true : !!(order as any).buyerConfirmedAt;
        const sellerConfirmed = order.sellerId === userId ? true : !!(order as any).sellerConfirmedAt;

        if (buyerConfirmed && sellerConfirmed) {
            console.log(`[CONFIRM] Both confirmed. Completing order ${orderId}`);
            dataToUpdate.status = "COMPLETED";
            dataToUpdate.releasedAt = new Date();

            try {
                // Revenue Split: Total - Platform Fee = Seller payout
                const sellerAmount = order.totalCents - order.platformFeeCents;
                console.log(`[CONFIRM] Releasing ${sellerAmount} cents to seller ${order.sellerId} (Total: ${order.totalCents}, Fee: ${order.platformFeeCents})`);
                await prisma.user.update({
                    where: { id: order.sellerId },
                    data: {
                        balanceCents: {
                            increment: sellerAmount
                        }
                    } as any
                });
            } catch (payoutErr) {
                console.error(`[CONFIRM] Payout failed for order ${orderId}:`, payoutErr);
            }

            // Delete listing if it's ONE_TIME
            if ((order.listing as any).listingType === "ONE_TIME") {
                await prisma.listing.update({
                    where: { id: order.listingId },
                    data: { active: false },
                }).catch(() => { });
            }
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: dataToUpdate,
        });

        const otherParty = order.buyerId === userId ? order.sellerId : order.buyerId;
        await createNotification({
            userId: otherParty,
            type: "order",
            title: "Order confirmed",
            body: "The other party confirmed the exchange.",
            linkUrl: `/market/orders/${order.id}`,
            metadata: { orderId: order.id, status: (updated as any).status, action: "CONFIRMED_EXCHANGE" },
        });

        if ((updated as any).status === "COMPLETED") {
            await Promise.all([
                createNotification({
                    userId: order.sellerId,
                    type: "order",
                    title: "Order completed",
                    body: `Order ${order.id.slice(-6)} is completed.`,
                    linkUrl: `/market/orders/${order.id}`,
                    metadata: { orderId: order.id, status: "COMPLETED" },
                }),
                createNotification({
                    userId: order.buyerId,
                    type: "order",
                    title: "Order completed",
                    body: `Order ${order.id.slice(-6)} is completed.`,
                    linkUrl: `/market/orders/${order.id}`,
                    metadata: { orderId: order.id, status: "COMPLETED" },
                }),
                refreshSellerStats(order.sellerId),
            ]);
        }

        console.log(`[CONFIRM] Success for ${userId} on ${orderId}. Status=${updated.status}`);
        return NextResponse.json({ order: updated });
    } catch (e: any) {
        console.error(`[CONFIRM] Unexpected error for ${userId} on ${orderId}:`, e);
        return NextResponse.json({ error: "Failed to update order", details: e.message }, { status: 500 });
    }
}
