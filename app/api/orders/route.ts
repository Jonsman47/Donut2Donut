import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { calculatePurchaseSplit } from "@/lib/purchases";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("ORDER_POST_SESSION:", JSON.stringify(session));

    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const buyerId = (session.user as any).id as string;

    // Verify buyer exists in DB
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please sign out and sign in again." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    console.log("ORDER_POST_BODY:", JSON.stringify(body));

    if (!body || !body.listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1;
    const couponId = body.couponId as string | undefined;

    const listing = await prisma.listing.findUnique({
      where: { id: body.listingId },
      include: { seller: { select: { id: true } } },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (!listing.seller) {
      return NextResponse.json(
        { error: "The seller of this listing no longer exists." },
        { status: 400 }
      );
    }

    if (listing.sellerId === buyerId) {
      return NextResponse.json(
        { error: "You cannot buy your own listing." },
        { status: 400 }
      );
    }

    // Check for recent duplicate order (same buyer, same listing, status REQUESTED, last 10s)
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const existingRecentOrder = await prisma.order.findFirst({
      where: {
        buyerId,
        listingId: listing.id,
        status: "REQUESTED",
        createdAt: { gte: tenSecondsAgo },
      },
    });

    if (existingRecentOrder) {
      return NextResponse.json(
        { error: "An identical request is already being processed." },
        { status: 429 }
      );
    }

    const unitPriceCents = listing.priceCents;
    const subtotalCents = unitPriceCents * quantity;

    const wallet = await prisma.userWallet.findUnique({ where: { userId: buyerId } });
    let couponDiscountCents = 0;
    let lifetimeDiscountCents = 0;
    let appliedCouponId: string | null = null;

    if (couponId) {
      const coupon = await prisma.userCoupon.findFirst({
        where: { id: couponId, userId: buyerId, isUsed: false },
      });
      if (!coupon) {
        return NextResponse.json({ error: "Coupon invalid or already used" }, { status: 400 });
      }
      couponDiscountCents = Math.round(unitPriceCents * (coupon.valuePercent / 100));
      appliedCouponId = coupon.id;
    }

    if (wallet?.lifetimeDiscountBps) {
      const lifetimeRate = wallet.lifetimeDiscountBps / 1000;
      lifetimeDiscountCents = Math.round((subtotalCents - couponDiscountCents) * lifetimeRate);
    }

    const rawDiscountCents = couponDiscountCents + lifetimeDiscountCents;
    const discountCap = Math.round(subtotalCents * 0.3);
    const discountCents = Math.min(rawDiscountCents, discountCap);
    const totalCents = Math.max(subtotalCents - discountCents, 0);
    const commissionSplit = calculatePurchaseSplit(totalCents, buyer);
    const platformFeeCents = commissionSplit.platformFeeCents;

    console.log(`[ORDER_CREATE] listing.priceCents=${listing.priceCents}, quantity=${quantity}, totalCents=${totalCents}, fee=${platformFeeCents}`);

    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId: listing.sellerId,
        listingId: listing.id,
        quantity,
        unitPriceCents,
        subtotalCents,
        platformFeeCents,
        discountCents,
        totalCents,
        couponId: appliedCouponId,
        status: "REQUESTED",
        safeTradeCode: null,
        buyerDisputeDeadline: null,
      } as any,
    });

    if (appliedCouponId) {
      await prisma.userCoupon.update({
        where: { id: appliedCouponId },
        data: { isUsed: true, usedAt: new Date(), orderIdUsedOn: order.id },
      });
    }

    await createNotification({
      userId: listing.sellerId,
      type: "order",
      title: "New purchase request",
      body: `New request for ${listing.title}.`,
      linkUrl: `/market/orders/${order.id}`,
      metadata: { orderId: order.id, status: order.status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("ORDER_CREATE_ERROR:", error);
    return NextResponse.json(
      { error: "Error while creating order", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const url = new URL(req.url);
  const role = url.searchParams.get("role") || "buyer";

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const baseWhere =
    role === "seller" ? { sellerId: userId } : { buyerId: userId };

  const where = {
    ...baseWhere,
    OR: [
      { status: { not: "DECLINED" } },
      {
        status: "DECLINED",
        updatedAt: { gte: oneDayAgo }
      }
    ]
  };

  const orders = await prisma.order.findMany({
    where,
    include: {
      listing: { include: { images: true } },
      buyer: { select: { id: true, username: true, image: true } },
      seller: { select: { id: true, username: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
