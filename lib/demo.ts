import { prisma } from "@/lib/prisma";

// Mets à false dès que tu veux utiliser les vraies annonces DB
export const DEMO_MODE = false;

export type Listing = {
  id: string;
  title: string;
  imageUrl: string;
  priceLabel: string;

  sellerId: string;        // <= ajouté
  sellerName: string;
  sellerVerified: boolean;

  trustPercent: number;
  reviewCount: number;

  delivery:
    | "Instant"
    | "Manual"
    | "In-game trade"
    | "Service"
    | "Scheduled"
    | "Milestones";

  escrowOn: boolean;
  tags?: string[];
};

const DEMO_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Rare DonutSMP kit bundle",
    imageUrl: "/donut3.png",
    priceLabel: "€19.99",
    sellerId: "demo-seller-id-1",
    sellerName: "demo_seller",
    sellerVerified: true,
    trustPercent: 92,
    reviewCount: 41,
    delivery: "Instant",
    escrowOn: true,
    tags: ["Hot", "Fast"],
  },
  {
    id: "2",
    title: "PvP coaching (60 minutes)",
    imageUrl: "/donut2.png",
    priceLabel: "€12.00",
    sellerId: "demo-seller-id-2",
    sellerName: "coach_kai",
    sellerVerified: true,
    trustPercent: 88,
    reviewCount: 19,
    delivery: "Scheduled",
    escrowOn: true,
    tags: ["Booked"],
  },
  {
    id: "3",
    title: "Custom mega-base build",
    imageUrl: "/donut3.png",
    priceLabel: "€35.00",
    sellerId: "demo-seller-id-3",
    sellerName: "builder_nyx",
    sellerVerified: false,
    trustPercent: 95,
    reviewCount: 63,
    delivery: "Milestones",
    escrowOn: true,
    tags: ["Pro"],
  },
  {
    id: "4",
    title: "Overlay + HUD pack (HD)",
    imageUrl: "/donut2.png",
    priceLabel: "€7.50",
    sellerId: "demo-seller-id-4",
    sellerName: "edit_lab",
    sellerVerified: true,
    trustPercent: 90,
    reviewCount: 28,
    delivery: "Instant",
    escrowOn: true,
    tags: ["Instant"],
  },
];

/**
 * Liste des annonces.
 * - Si DEMO_MODE = true → utilise la liste en mémoire
 * - Si DEMO_MODE = false → lit les annonces depuis Prisma
 */
export async function getListings(): Promise<Listing[]> {
  if (DEMO_MODE) return DEMO_LISTINGS;

  const listings = await prisma.listing.findMany({
    include: { images: true, seller: true, sellerProfile: false },
    orderBy: { createdAt: "desc" },
  }); // [web:631]

  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    imageUrl: l.images[0]?.url ?? "/donut2.png",
    priceLabel: `${l.priceCents / 100} €`,

    sellerId: l.sellerId,
    sellerName: l.seller.username,
    sellerVerified: !!l.seller.sellerProfile,

    trustPercent: 90,
    reviewCount: 0,
    delivery:
      l.deliveryType === "INGAME_TRADE"
        ? "In-game trade"
        : l.deliveryType === "SERVICE"
        ? "Service"
        : l.deliveryType === "MANUAL_DM"
        ? "Manual"
        : "Instant",
    escrowOn: l.escrowOnly,
    tags: [],
  }));
}

/**
 * Une annonce par ID.
 * - Si DEMO_MODE = true → cherche dans DEMO_LISTINGS
 * - Si DEMO_MODE = false → lit depuis Prisma
 */
export async function getListingById(id: string): Promise<Listing | null> {
  if (DEMO_MODE) return DEMO_LISTINGS.find((x) => x.id === id) || null;

  const l = await prisma.listing.findUnique({
    where: { id },
    include: { images: true, seller: true },
  }); // [web:631]

  if (!l) return null;

  return {
    id: l.id,
    title: l.title,
    imageUrl: l.images[0]?.url ?? "/donut2.png",
    priceLabel: `${l.priceCents / 100} €`,

    sellerId: l.sellerId,
    sellerName: l.seller.username,
    sellerVerified: !!l.seller.sellerProfile,

    trustPercent: 90,
    reviewCount: 0,
    delivery:
      l.deliveryType === "INGAME_TRADE"
        ? "In-game trade"
        : l.deliveryType === "SERVICE"
        ? "Service"
        : l.deliveryType === "MANUAL_DM"
        ? "Manual"
        : "Instant",
    escrowOn: l.escrowOnly,
    tags: [],
  };
}

/**
 * Compatibilité avec l’ancien code : toujours mock.
 */
export function getDemoListings() {
  return DEMO_LISTINGS;
}
export function getDemoListingById(id: string) {
  return DEMO_LISTINGS.find((x) => x.id === id) || null;
}
