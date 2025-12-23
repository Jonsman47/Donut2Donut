import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateUserStats } from '@/lib/profile/stats';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;
  const { username } = params;

  try {
    // Récupérer l'utilisateur avec son profil
    const user = await prisma.user.findUnique({
      where: { 
        username: username 
      },
      include: {
        sellerProfile: true,
        sellerStats: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const stats = await updateUserStats(user.id);
    const follow = viewerId
      ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: user.id
            }
          }
        })
      : null;

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } })
    ]);

    // Vérifier si l'utilisateur connecté suit ce profil
    const isFollowing = !!follow;

    // Formater la réponse
    const response = {
      id: user.id,
      username: user.username,
      name: user.realName || user.username,
      image: user.image,
      bio: user.sellerProfile?.bio ?? null,
      bannerUrl: user.sellerProfile?.bannerUrl ?? null,
      trustLevel: user.sellerProfile?.trustLevel ?? Math.min(Math.floor(stats.totalSales / 10), 5),
      totalSales: stats.totalSales,
      completedTrades: stats.completedTrades,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      successRate: Math.round(stats.successRate),
      averageResponseTime: stats.averageResponseTime.toFixed(1),
      responseTime: stats.averageResponseTime.toFixed(1),
      followersCount,
      followingCount,
      isFollowing,
      createdAt: user.createdAt.toISOString(),
      lastActive: (user.sellerProfile?.updatedAt || user.updatedAt).toISOString(),
      location: user.sellerProfile?.timezone ?? null,
      email: user.email ?? undefined,
      phone: user.privateEmail ?? null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
