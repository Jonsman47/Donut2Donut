export function trustLevelFromScore(score: number) {
  if (score >= 900) return 5;
  if (score >= 600) return 4;
  if (score >= 350) return 3;
  if (score >= 150) return 2;
  if (score >= 50) return 1;
  return 0;
}

export function computeSellerLimits(trustLevel: number) {
  switch (trustLevel) {
    case 0: return { listingLimit: 3,  maxPriceCents: 2000,  payoutHoldDays: 7 };
    case 1: return { listingLimit: 8,  maxPriceCents: 5000,  payoutHoldDays: 7 };
    case 2: return { listingLimit: 20, maxPriceCents: 15000, payoutHoldDays: 2 };
    case 3: return { listingLimit: 50, maxPriceCents: 50000, payoutHoldDays: 2 };
    case 4: return { listingLimit: 120,maxPriceCents: 150000,payoutHoldDays: 0 };
    case 5: return { listingLimit: 300,maxPriceCents: 500000,payoutHoldDays: 0 };
    default: return { listingLimit: 3, maxPriceCents: 2000, payoutHoldDays: 7 };
  }
}

export const TRUST_DELTAS = {
  ORDER_COMPLETED: +10,
  FAST_DELIVERY: +3,
  VERIFIED_DISCORD: +15,
  ENABLE_2FA: +25,
  ID_VERIFIED: +50,
  DISPUTE_LOST: -60,
  SCAM_CONFIRMED: -200,
  CANCELLED_BY_SELLER: -10,
  LATE_NO_COMMS: -15,
} as const;
