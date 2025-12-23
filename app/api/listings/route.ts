import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { trustBadgeFromScore } from "@/lib/trust-score";

// GET /api/listings
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const cat = url.searchParams.get("cat") || "";
  const escrow = url.searchParams.get("escrow") !== "0";

  const where: any = { active: true };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (cat) where.category = { slug: cat };
  if (escrow) where.escrowOnly = true;

  const listings = await prisma.listing.findMany({
    where,
    take: 60,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      seller: { include: { sellerProfile: true, sellerStats: true } },
      images: true,
    },
  });

  const sellerIds = Array.from(new Set(listings.map((listing) => listing.sellerId)));
  const reviewStats = sellerIds.length
    ? await prisma.review.groupBy({
      by: ["toId"],
      where: { toId: { in: sellerIds } },
      _avg: { rating: true },
      _count: { rating: true },
    })
    : [];

  const reviewBySeller = new Map(
    reviewStats.map((stat) => [
      stat.toId,
      {
        avg: stat._avg.rating ?? 0,
        count: stat._count.rating,
      },
    ])
  );

  const payload = listings.map((listing) => {
    const review = reviewBySeller.get(listing.sellerId);
    const trustPercent = review ? Math.round((review.avg / 5) * 100) : 0;
    const trustScore = listing.seller.sellerStats?.trustScore ?? trustPercent;
    const trustBadge = trustBadgeFromScore(trustScore);
    return {
      ...listing,
      trustPercent,
      trustScore,
      trustBadge,
      reviewCount: review?.count ?? 0,
    };
  });

  return NextResponse.json({ listings: payload });
}

// POST /api/listings
export async function POST(req: Request) {
  try {
    // 1) Récupérer la session (user connecté)
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const sellerId = (session.user as any).id as string;

    // 2) Lire le body envoyé par le client
    const body = await req.json();

    const {
      title,
      description,
      whatYouGet,
      priceCents,
      stock,
      deliveryType,
      imageUrl,
      listingType,
    } = body;

    // 3) Vérifier les champs obligatoires
    if (!title || !description || !priceCents || !deliveryType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4) Récupérer une category existante (par défaut)
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "General",
          slug: "general",
        },
      });
    }

    console.log(`[LISTING_CREATE] Body:`, JSON.stringify(body));
    console.log(`[LISTING_CREATE] priceCents: ${priceCents}`);

    // 5) Créer l'annonce liée au user connecté
    const listing = await prisma.listing.create({
      data: {
        sellerId, // <= ici : le compte connecté
        categoryId: category.id,
        title,
        description,
        whatYouGet,
        priceCents,
        stock: stock ?? 1,
        deliveryType,
        listingType: listingType || "STOCK",
        // currency et escrowOnly ont des valeurs par défaut dans Prisma
        images: imageUrl
          ? {
            create: [{ url: imageUrl }],
          }
          : undefined,
      },
      include: {
        category: true,
        seller: { include: { sellerProfile: true } },
        images: true,
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (e) {
    console.error("LISTING_CREATE_ERROR:", e);
    return NextResponse.json({ error: "Server error", details: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
