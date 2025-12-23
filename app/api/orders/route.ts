import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const listing = await prisma.listing.findUnique({
      where: { id: body.listingId },
      include: { seller: true },
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
    const totalCents = subtotalCents;
    const platformFeeCents = Math.round(totalCents * 0.1);

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
        totalCents,
        status: "REQUESTED",
        safeTradeCode: null,
        buyerDisputeDeadline: null,
      } as any,
    });

    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: "ORDER_STATUS",
        data: JSON.stringify({
          orderId: order.id,
          status: order.status,
        }),
      },
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
      buyer: true,
      seller: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
