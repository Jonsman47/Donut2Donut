import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platformFeeCents, makeSafeTradeCode } from "@/lib/policies";
import { requireUser } from "@/lib/auth";
import { createPaymentIntentForEscrow } from "@/lib/stripe";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = await req.json();
  const { listingId, quantity = 1 } = body;

  const listing = await db.listing.findUnique({ where: { id: listingId }, include: { seller: { include: { sellerProfile: true } } } });
  if (!listing || !listing.active) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const sellerProfile = listing.seller.sellerProfile;
  if (!sellerProfile) return NextResponse.json({ error: "Seller not enabled" }, { status: 400 });

  const subtotal = listing.priceCents * quantity;
  const fee = platformFeeCents(subtotal);
  const total = subtotal; // show fee included or separate in UI

  if (listing.priceCents > sellerProfile.maxPriceCents) {
    return NextResponse.json({ error: "Seller trust too low for this price cap" }, { status: 403 });
  }

  const now = new Date();
  const disputeHours = 48;
  const buyerDisputeDeadline = new Date(now.getTime() + disputeHours * 60 * 60 * 1000);
  const safeTradeCode = makeSafeTradeCode();

  const order = await db.order.create({
    data: {
      buyerId: user.id,
      sellerId: listing.sellerId,
      listingId: listing.id,
      quantity,
      unitPriceCents: listing.priceCents,
      subtotalCents: subtotal,
      platformFeeCents: fee,
      totalCents: total,
      status: "AWAITING_SELLER_ACCEPT",
      safeTradeCode,
      buyerDisputeDeadline,
    },
  });

  const pi = await createPaymentIntentForEscrow({
    orderId: order.id,
    amountCents: total,
    currency: listing.currency,
    buyerEmail: user.email ?? undefined,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: pi.id, escrowFundedAt: new Date(), status: "PAID" },
  });

  return NextResponse.json({ orderId: order.id, clientSecret: (pi as any).client_secret ?? null });
}
