import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  const role = user?.role ?? ((session as any)?.role as string | undefined);
  if (!user?.id || (role !== "ADMIN" && process.env.NODE_ENV !== "development")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buyer =
    (await prisma.user.findUnique({ where: { username: "buyer-demo" } })) ||
    (await prisma.user.create({
      data: { username: "buyer-demo", email: "buyer@demo.local" },
    }));

  const seller =
    (await prisma.user.findUnique({ where: { username: "seller-demo" } })) ||
    (await prisma.user.create({
      data: {
        username: "seller-demo",
        email: "seller@demo.local",
        sellerProfile: { create: {} },
      },
    }));

  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({ data: { name: "General", slug: "general" } });
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      categoryId: category.id,
      title: "Demo DonutSMP kit",
      description: "Starter bundle for new players.",
      whatYouGet: "Items delivered in-game",
      priceCents: 1500,
      deliveryType: "INGAME_TRADE",
      stock: 5,
      images: { create: [{ url: "/donut-hero.png" }] },
    },
  });

  const order = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing.id,
      quantity: 1,
      unitPriceCents: listing.priceCents,
      subtotalCents: listing.priceCents,
      platformFeeCents: 150,
      totalCents: listing.priceCents + 150,
      status: "PENDING",
      safeTradeCode: "D2D-DEMO",
      buyerDisputeDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  await prisma.tradeMessage.create({
    data: {
      senderId: buyer.id,
      orderId: order.id,
      content: "Hi! Is the demo kit still available?",
    },
  });

  return NextResponse.json({
    buyerId: buyer.id,
    sellerId: seller.id,
    listingId: listing.id,
    orderId: order.id,
  });
}
