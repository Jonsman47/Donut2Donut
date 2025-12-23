import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { updateUserStats } from '@/lib/profile/stats';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  const { username } = params;

  try {
    // Récupérer l'utilisateur avec son profil
    const user = await prisma.user.findUnique({
      where: { 
        username: username 
      },
      include: {
        sellerProfile: true,
        sellerStats: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur connecté suit ce profil
    let isFollowing = false;
    if (session?.user?.id) {
      const follow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id
          }
        }
      });
      isFollowing = !!follow;
    }

    // Formater la réponse
    const response = {
      id: user.id,
      username: user.username,
      name: user.realName || user.username,
      image: user.image,
      bio: user.sellerProfile?.bio,
      bannerUrl: user.sellerProfile?.bannerUrl,
      trustLevel: user.sellerProfile?.trustLevel || 0,
      totalSales: user.sellerStats?.completedOrdersCount || 0,
      averageRating: user.sellerStats?.avgRating || 0,
      totalRatings: user.sellerStats?.reviewCount || 0,
      successRate: user.sellerProfile?.completionRate || 0,
      responseTime: user.sellerProfile?.avgDeliveryMinutes ? 
        (user.sellerProfile.avgDeliveryMinutes / 60).toFixed(1) + 'h' : 'N/A',
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing,
      createdAt: user.createdAt,
      lastActive: user.sellerProfile?.updatedAt || user.updatedAt
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
