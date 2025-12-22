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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const buyerId = session.user.id as string;

  const body = await req.json().catch(() => null);
  if (!body || !body.listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1;

  const listing = await prisma.listing.findUnique({
    where: { id: body.listingId },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.sellerId === buyerId) {
    return NextResponse.json(
      { error: "Tu ne peux pas acheter ta propre annonce." },
      { status: 400 }
    );
  }

  const unitPriceCents = listing.priceCents;
  const subtotalCents = unitPriceCents * quantity;
  const platformFeeCents = Math.round(subtotalCents * 0.1);
  const totalCents = subtotalCents + platformFeeCents;

  const safeTradeCode = generateSafeTradeCode();
  const buyerDisputeDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

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
      status: "PAID",
      safeTradeCode,
      buyerDisputeDeadline,
    },
  });

  return NextResponse.json({ order });
}
