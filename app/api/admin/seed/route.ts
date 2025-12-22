import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  if (!session?.user?.id || (role !== "ADMIN" && process.env.NODE_ENV !== "development")) {
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

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: {
        listingId: listing.id,
        buyerId: buyer.id,
        sellerId: seller.id,
      },
    },
    create: {
      listingId: listing.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      lastMessageAt: new Date(),
    },
    update: {},
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: buyer.id,
      body: "Hi! Is the demo kit still available?",
    },
  });

  return NextResponse.json({
    buyerId: buyer.id,
    sellerId: seller.id,
    listingId: listing.id,
    orderId: order.id,
  });
}
