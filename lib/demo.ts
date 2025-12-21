export const DEMO_MODE = true; // later: set false when real backend is ready

export type Listing = {
  id: string;
  title: string;
  imageUrl: string;
  priceLabel: string;

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
 * Later you replace these with real DB/API calls.
 * Keep the same function names so NO UI files need changes.
 */
export async function getListings(): Promise<Listing[]> {
  if (DEMO_MODE) return DEMO_LISTINGS;
  // TODO: replace with real fetch/db
  return [];
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (DEMO_MODE) return DEMO_LISTINGS.find((x) => x.id === id) || null;
  // TODO: replace with real fetch/db
  return null;
}

/**
 * Backwards compat so your current pages still work right now.
 * (We’ll update pages next to use getListings/getListingById.)
 */
export function getDemoListings() {
  return DEMO_LISTINGS;
}
export function getDemoListingById(id: string) {
  return DEMO_LISTINGS.find((x) => x.id === id) || null;
}
