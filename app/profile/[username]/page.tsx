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
  completedTrades: number;
  averageResponseTime: string;
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
  completedTrades: 0,
  averageResponseTime: '0',
  responseTime: '0',
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
  createdAt: '',
  lastActive: '',
  phone: null,
  location: null,
  email: '',
};

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { data: session, status } = useSession();
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Charger les données du profil
  useEffect(() => {
    async function fetchProfile() {
      if (!params.username || status === 'loading') return;
      
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
        setIsOwner(session?.user?.id === data.id);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [params.username, status, session?.user?.id, router]);

  const toggleFollow = async () => {
    if (!session?.user?.id) {
      router.push('/login');
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
        throw new Error('Failed to update follow status');
      }

      const data = await res.json();
      setIsFollowing(data.isFollowing);

      // Mettre à jour le compteur d'abonnés localement
      setProfileData((current) => {
        if (!current) return current;

        const nextFollowers =
          typeof data.followersCount === 'number'
            ? data.followersCount
            : data.isFollowing
              ? current.followersCount + 1
              : Math.max(0, current.followersCount - 1);

        return {
          ...current,
          followersCount: nextFollowers,
          isFollowing: data.isFollowing,
        };
      });

      toast.success(
        data.isFollowing
          ? 'Vous suivez maintenant cet utilisateur'
          : 'Vous ne suivez plus cet utilisateur'
      );
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Une erreur est survenue');
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Profil non trouvé</h1>
        <p className="text-gray-600 mt-2">Le profil demandé n&apos;existe pas ou n&apos;est pas accessible.</p>
      </div>
    );
  }

  const parsedResponseTime = Number.parseFloat(profileData.responseTime);
  const responseTimeValue = Number.isFinite(parsedResponseTime) ? parsedResponseTime : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Bannière du profil */}
      <div
        className="h-48 md:h-64 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative"
        style={profileData.bannerUrl ? {
          backgroundImage: `url(${profileData.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      </div>

      {/* Conteneur principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Section avatar et infos de base */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
          {/* Avatar */}
          <div className="relative -mt-16 md:-mt-20">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden shadow-lg">
              {profileData.image ? (
                <img
                  src={profileData.image}
                  alt={profileData.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>

          {/* Infos du profil */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                  <span className="ml-2 text-sm font-normal bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                    Niveau {profileData.trustLevel}
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300">@{profileData.username}</p>
              </div>

              {!isOwner && (
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isFollowing ? '✓ Suivi' : 'Suivre'}
                </button>
              )}
            </div>

            {/* Stats du profil */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">{profileData.averageRating.toFixed(1)}</span>
                <span className="mx-1">•</span>
                <span>{profileData.totalRatings} avis</span>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Réponse: {profileData.responseTime}</span>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{profileData.successRate}% de réussite</span>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{profileData.followersCount} abonnés</span>
                <span className="mx-1">•</span>
                <span>{profileData.followingCount} abonnements</span>
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Inscrit le {new Date(profileData.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="mt-4 text-gray-700 dark:text-gray-300">
                <p>{profileData.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation secondaire */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <a href="#" className="border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 whitespace-nowrap py-4 px-1 font-medium text-sm">
              Aperçu
            </a>
            <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap py-4 px-1 font-medium text-sm">
              Annonces
            </a>
            <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap py-4 px-1 font-medium text-sm">
              Avis
            </a>
            <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap py-4 px-1 font-medium text-sm">
              Activité
            </a>
          </nav>
        </div>

        {/* Section principale du profil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Statistiques */}
          <div className="lg:col-span-1 space-y-6">
            {/* Carte de statistiques */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistiques</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>Ventes effectuées</span>
                    <span className="font-medium text-gray-900 dark:text-white">{profileData.totalSales}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (profileData.totalSales / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>Commandes complétées</span>
                    <span className="font-medium text-gray-900 dark:text-white">{profileData.completedTrades}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (profileData.completedTrades / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>Taux de réponse</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileData.averageResponseTime} (moy.)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.max(0, 100 - (responseTimeValue * 10))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Niveau de confiance</h3>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Niveau {profileData.trustLevel}</span>
                      <span>{profileData.trustLevel * 20}/100 points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: `${profileData.trustLevel * 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Atteignez le niveau {profileData.trustLevel + 1} en complétant plus de commandes
                </p>
              </div>
            </div>

            {/* Badges et récompenses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Badges</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.totalSales >= 10 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Vendeur vérifié
                  </span>
                )}
                {profileData.averageRating >= 4.5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Top vendeur
                  </span>
                )}
                {profileData.completedTrades >= 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Fiable
                  </span>
                )}
                {profileData.followersCount >= 10 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM7 9a5 5 0 11-10 0 5 5 0 0110 0z" />
                    </svg>
                    Populaire
                  </span>
                )}
              </div>
            </div>

            {/* Informations de contact */}
            {isOwner && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations de contact</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {session?.user?.email || 'Non renseigné'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {profileData.phone || 'Non renseigné'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profileData.location || 'Non renseigné'}
                  </div>
                </div>
                <button className="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                  Modifier le profil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .profile-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
