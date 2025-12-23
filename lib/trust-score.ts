export const TRUST_BADGES = [
  { min: 90, label: "Elite" },
  { min: 75, label: "Trusted" },
  { min: 60, label: "Solid" },
  { min: 0, label: "New/Unrated" },
] as const;

export function clampTrustScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function trustBadgeFromScore(score: number) {
  const clamped = clampTrustScore(score);
  return TRUST_BADGES.find((badge) => clamped >= badge.min)?.label ?? "New/Unrated";
}

export function computeTrustScore({
  completedOrdersCount,
  verifiedProofCount,
  avgRating,
  disputeCount,
}: {
  completedOrdersCount: number;
  verifiedProofCount: number;
  avgRating: number;
  disputeCount: number;
}) {
  const base = 50;
  const completedPoints = Math.min(completedOrdersCount * 2, 40);
  const proofPoints = Math.min(verifiedProofCount * 3, 30);
  const ratingPoints = (avgRating - 3) * 10;
  const disputePenalty = disputeCount * 10;

  return clampTrustScore(base + completedPoints + proofPoints + ratingPoints - disputePenalty);
}
