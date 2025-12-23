import { prisma } from "@/lib/prisma";
import { computeTrustScore } from "@/lib/trust-score";

export async function refreshSellerStats(sellerId: string) {
  const [completedOrdersCount, verifiedProofCount, reviewStats, disputeCount] = await Promise.all([
    prisma.order.count({
      where: { sellerId, status: "COMPLETED" },
    }),
    prisma.deliveryProof.count({
      where: {
        status: "ACCEPTED",
        order: { sellerId },
      },
    }),
    prisma.review.aggregate({
      where: { toId: sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.dispute.count({
      where: {
        order: { sellerId },
        decision: { in: ["REFUND_BUYER", "PARTIAL_REFUND"] },
      },
    }),
  ]);

  const avgRating = reviewStats._avg.rating ?? 0;
  const reviewCount = reviewStats._count.rating ?? 0;
  const trustScore = computeTrustScore({
    completedOrdersCount,
    verifiedProofCount,
    avgRating,
    disputeCount,
  });

  return prisma.sellerStats.upsert({
    where: { sellerId },
    update: {
      trustScore,
      completedOrdersCount,
      verifiedProofCount,
      avgRating,
      reviewCount,
      disputeCount,
      lastUpdatedAt: new Date(),
    },
    create: {
      sellerId,
      trustScore,
      completedOrdersCount,
      verifiedProofCount,
      avgRating,
      reviewCount,
      disputeCount,
      lastUpdatedAt: new Date(),
    },
  });
}
