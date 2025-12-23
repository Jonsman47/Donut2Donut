import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Vous devez être connecté pour effectuer cette action' },
      { status: 401 }
    );
  }

  const { username } = params;

  try {
    // Trouver l'utilisateur à suivre
    const userToFollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!userToFollow) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur ne s'ajoute pas lui-même
    if (session.user.email === userToFollow.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous suivre vous-même' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur suit déjà
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.email,
          followingId: userToFollow.id
        }
      }
    });

    let isFollowing = false;

    if (existingFollow) {
      // Si l'utilisateur suit déjà, supprimer le suivi
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.email,
            followingId: userToFollow.id
          }
        }
      });
      isFollowing = false;
    } else {
      // Sinon, ajouter le suivi
      await prisma.follows.create({
        data: {
          follower: { connect: { email: session.user.email } },
          following: { connect: { id: userToFollow.id } }
        }
      });
      isFollowing = true;
    }

    // Mettre à jour les statistiques
    await prisma.sellerStats.upsert({
      where: { userId: userToFollow.id },
      update: {
        followersCount: {
          [isFollowing ? 'increment' : 'decrement']: 1
        }
      },
      create: {
        user: { connect: { id: userToFollow.id } },
        followersCount: 1
      }
    });

    return NextResponse.json({ isFollowing });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du suivi:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du suivi' },
      { status: 500 }
    );
  }
}
