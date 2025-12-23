import { prisma } from '@/lib/prisma';

export async function updateUserStats(userId: string) {
  // Récupérer toutes les commandes complétées de l'utilisateur
  const completedOrders = await prisma.order.findMany({
    where: {
      OR: [
        { buyerId: userId },
        { sellerId: userId }
      ],
      status: 'COMPLETED'
    },
    include: {
      review: true,
      listing: true
    }
  });

  // Calculer les statistiques de base
  const sellerOrders = completedOrders.filter(order => order.sellerId === userId);
  const buyerOrders = completedOrders.filter(order => order.buyerId === userId);
  
  const totalSales = sellerOrders.length;
  const totalPurchases = buyerOrders.length;
  const completedTrades = completedOrders.length;

  // Calculer la note moyenne
  const ratings = sellerOrders
    .filter(order => order.review)
    .map(order => order.review!.rating);
  
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings
    : 0;

  // Calculer le temps de réponse moyen (en heures)
  const responseTimes = sellerOrders
    .filter(order => order.review?.createdAt && order.escrowFundedAt)
    .map(order => {
      const deliveryTime = order.review!.createdAt.getTime() - order.escrowFundedAt!.getTime();
      return deliveryTime / (1000 * 60 * 60); // Conversion en heures
    });
  
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;

  // Calculer le taux de réussite
  const successfulTrades = sellerOrders.filter(order => 
    order.review?.rating && order.review.rating >= 3
  ).length;
  
  const successRate = sellerOrders.length > 0
    ? (successfulTrades / sellerOrders.length) * 100
    : 0;

  // Mettre à jour les statistiques du vendeur
  await prisma.sellerStats.upsert({
    where: { sellerId: userId },
    update: {
      completedOrdersCount: totalSales,
      avgRating: averageRating,
      reviewCount: totalRatings,
      lastUpdatedAt: new Date()
    },
    create: {
      sellerId: userId,
      completedOrdersCount: totalSales,
      avgRating: averageRating,
      reviewCount: totalRatings,
      lastUpdatedAt: new Date()
    }
  });

  // Mettre à jour le profil du vendeur
  await prisma.sellerProfile.upsert({
    where: { userId },
    update: {
      completionRate: successRate,
      avgDeliveryMinutes: Math.round(averageResponseTime * 60), // Conversion en minutes
      updatedAt: new Date()
    },
    create: {
      userId,
      completionRate: successRate,
      avgDeliveryMinutes: Math.round(averageResponseTime * 60),
      trustLevel: Math.min(Math.floor(totalSales / 10), 5) // Niveau de confiance basé sur le nombre de ventes
    }
  });

  return {
    totalSales,
    totalPurchases,
    completedTrades,
    averageRating,
    averageResponseTime,
    successRate,
    totalRatings
  };
}

export async function onOrderCompleted(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { seller: true, buyer: true }
  });

  if (!order) return;

  // Mettre à jour les statistiques du vendeur et de l'acheteur
  await Promise.all([
    updateUserStats(order.sellerId),
    updateUserStats(order.buyerId)
  ]);
}
