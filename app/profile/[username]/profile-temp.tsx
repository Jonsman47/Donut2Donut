'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

type ProfileData = {
  id: string;
  username: string;
  name: string;
  image?: string;
  bio?: string;
  bannerUrl?: string;
  trustLevel: number;
  totalSales: number;
  averageRating: number;
  totalRatings: number;
  successRate: number;
  responseTime: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: string;
  lastActive: string;
  phone?: string | null;
  location?: string | null;
  email?: string;
};

const defaultProfile: ProfileData = {
  id: '',
  username: '',
  name: '',
  image: '',
  bio: '',
  bannerUrl: '',
  trustLevel: 1,
  totalSales: 0,
  averageRating: 0,
  totalRatings: 0,
  successRate: 0,
  responseTime: '0',
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  phone: null,
  location: null,
  email: '',
};

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/auth/signin';
    },
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Charger les données du profil
  useEffect(() => {
    async function fetchProfile() {
      if (!params.username) return;
      
      setIsLoading(true);
      try {
        const res = await fetch(`/api/profile/${params.username}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 404) {
            router.push('/404');
            return;
          }
          throw new Error('Échec du chargement du profil');
        }

        const data = await res.json();
        setProfileData(data);
        setIsFollowing(data.isFollowing);
        setIsOwner(session?.user?.email === data.email);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [params.username, status, session, router]);

  const toggleFollow = async () => {
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }

    try {
      const res = await fetch(`/api/profile/${params.username}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Échec de la mise à jour du suivi');
      }

      const data = await res.json();
      setIsFollowing(data.isFollowing);
      
      // Mettre à jour le compteur de followers
      if (profileData) {
        setProfileData({
          ...profileData,
          followersCount: data.isFollowing 
            ? profileData.followersCount + 1 
            : Math.max(0, profileData.followersCount - 1),
          isFollowing: data.isFollowing
        });
      }
      
      toast.success(data.isFollowing ? 'Vous suivez maintenant ce profil' : 'Vous ne suivez plus ce profil');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du suivi:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du suivi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-300">Profil non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">@{profileData.username}</p>
              </div>
              
              {!isOwner ? (
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-2 rounded-md font-medium ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isFollowing ? 'Suivi' : 'Suivre'}
                </button>
              ) : (
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Modifier le profil
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {profileData.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-6">{profileData.bio}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.followersCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Abonnés</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.followingCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Abonnements</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.totalSales}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Ventes</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.averageRating.toFixed(1)}
                  <span className="text-yellow-500">★</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
