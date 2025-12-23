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
  email: '',};

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
      {/* Bannière du profil */}
      <div
        className="h-48 md:h-64 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative"
        style={profileData.bannerUrl ? {
          backgroundImage: `url(${profileData.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Section avatar et infos de base */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
          {/* Avatar */}
          <div className="relative -mt-16 md:-mt-20">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden shadow-lg">
              {profileData.image ? (
                <img
                  src={profileData.image}
                  alt={profileData.name || 'Profil'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl font-bold">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
            {isOwner && (
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Infos utilisateur */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">@{profileData.username}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {!isOwner && (
                  <>
                    <button
                      onClick={toggleFollow}
                      className={`px-4 py-2 rounded-full font-medium transition-colors ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isFollowing ? 'Suivi' : 'Suivre'}
                    </button>
                    <button className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </>
                )}
                
                {isOwner && (
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                )}
              </div>
            </div>

            {profileData.bio && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {profileData.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {profileData.location && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profileData.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Membre depuis {new Date(profileData.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.followersCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abonnés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.followingCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abonnements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.totalSales}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ventes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.averageRating.toFixed(1)}
                  <span className="text-yellow-500 ml-1">★</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation secondaire */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <a href="#" className="border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 whitespace-nowrap py-4 px-1 font-medium text-sm">
              Activité récente
            </a>
            <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm">
              Annonces
            </a>
            <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm">
              Avis
            </a>
            <a href="#" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm">
              À propos
            </a>
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Statistiques */}
          <div className="lg:col-span-1 space-y-6">
            {/* Carte de statistiques */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistiques</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Note moyenne</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white mr-1">
                      {profileData.averageRating.toFixed(1)}
                    </span>
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ({profileData.totalRatings} avis)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Taux de réussite</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {profileData.successRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Temps de réponse</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {profileData.responseTime || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Niveau de confiance</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">
                        {i < profileData.trustLevel ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Badges</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.totalSales >= 10 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Vendeur confirmé
                  </span>
                )}
                {profileData.averageRating >= 4.5 && profileData.totalRatings >= 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Excellent vendeur
                  </span>
                )}
                {profileData.trustLevel >= 4 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Membre de confiance
                  </span>
                )}
                {profileData.totalSales >= 50 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Vétéran
                  </span>
                )}
              </div>
            </div>

            {/* Informations de contact (visible uniquement au propriétaire) */}
            {isOwner && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations de contact</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profileData.email}
                  </div>
                  {profileData.phone && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {profileData.phone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Colonne de droite - Activité récente */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activité récente</h2>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Exemple d'activité */}
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Nouvelle vente</span> - Votre annonce "Compte Minecraft Premium" a été achetée par @johndoe
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Il y a 2 heures
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Paiement reçu</span> - 19,99€ pour l'achat de "Compte Spotify Premium"
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Il y a 1 jour
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                      <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Nouvel avis</span> - @janedoe a donné une note de 5 étoiles à votre annonce
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Il y a 2 jours
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-center">
                <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Voir toute l'activité
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
