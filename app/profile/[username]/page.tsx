'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';
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
  createdAt: '',
  lastActive: '',
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
          credentials: 'include', // Important pour inclure les cookies de session
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
      // La redirection est gérée par useSession avec onUnauthenticated
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
      });

      if (!res.ok) {
        throw new Error('Failed to update follow status');
      }

      const data = await res.json();
      setIsFollowing(data.isFollowing);

      // Mettre à jour le compteur d'abonnés localement
      if (profileData) {
        setProfileData({
          ...profileData,
          followersCount: data.isFollowing
            ? profileData.followersCount + 1
            : Math.max(0, profileData.followersCount - 1),
          isFollowing: data.isFollowing,
        });
      }

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
        <p className="text-gray-600 mt-2">Le profil demandé n'existe pas ou n'est pas accessible.</p>
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
                      style={{ width: `${Math.max(0, 100 - (parseFloat(profileData.responseTime) * 10))}%` }}
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
          height: 16px;
          background-color: var(--success);
          border: 2px solid var(--bg-primary);
          border-radius: 50%;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-size: 3.5rem;
          font-weight: 600;
        }

        .profile-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          width: 100%;
          margin: 1rem 0;
        }

        .follow-button {
          padding: 0.6rem 1.8rem;
          border: none;
          border-radius: 12px;
          background: var(--primary);
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .follow-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.3);
        }

        .follow-button.following {
          background: var(--success);
          box-shadow: 0 4px 12px rgba(var(--success-rgb), 0.2);
        }

        .followers-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-secondary);
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          min-width: 100px;
        }

        .followers-count .count {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .followers-count .label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 0.2rem;
        }

        /* ===== Statistiques ===== */
        .profile-name-container {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        
        .profile-header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: var(--bg-secondary);
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        
        .profile-name {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .sales-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 1.5rem 0;
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0.5rem;
          background: var(--bg-primary);
          border-radius: 12px;
          transition: transform 0.2s ease;
        }

        .stat-box:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .stat-box .number {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0.2rem 0;
          line-height: 1;
        }

        .stat-box .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .success-rate {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 16px;
          margin: 1.5rem 0;
        }

        .success-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .success-label .percentage {
          font-weight: 600;
          color: var(--success);
        }

        .progress-bar {
          height: 8px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background: linear-gradient(90deg, var(--success), #4ade80);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        /* ===== Section d'activité ===== */
        .activity-section {
          grid-row: 1;
        }

        @media (min-width: 1024px) {
          .activity-section {
            grid-column: 1;
          }
        }

        /* ===== Cartes et sections ===== */
        .profile-section {
          margin-bottom: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border-color);
        }
        
        .profile-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-header.centered {
          justify-content: center;
        }

        .section-header h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .view-all {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-all:hover {
          background: var(--bg-secondary);
        }

        .edit-button {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .edit-button:hover {
          background: var(--bg-secondary);
          color: var(--primary);
        }

        .about-card {
          background: var(--card-bg);
          backdrop-filter: blur(5px);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 12px;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        
        .centered-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .centered-section .section-header {
          justify-content: center;
          width: 100%;
        }
        
        .centered-section .about-card {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .centered-content {
          text-align: center;
        }

        /* ===== Flux d'activité ===== */
        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          transition: transform 0.2s ease;
        }

        .activity-item:hover {
          transform: translateX(4px);
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(var(--primary-rgb), 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          color: var(--primary);
          flex-shrink: 0;
        }

        .activity-details {
          flex: 1;
        }

        .activity-details p {
          margin: 0 0 0.2rem 0;
          font-size: 0.95rem;
        }

        .activity-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .activity-amount {
          font-weight: 600;
          color: var(--success);
          margin-left: 1rem;
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .listing-card {
          background: var(--card-bg);
          backdrop-filter: blur(5px);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .listing-image {
          height: 140px;
          background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .listing-details {
          padding: 1.25rem;
        }

        .listing-details h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .listing-price {
          font-weight: 700;
          color: var(--primary);
          font-size: 1.2rem;
          margin: 0 0 0.75rem 0;
        }

        .listing-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .no-items {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .profile-header {
            padding: 1.5rem 1rem;
            border-radius: 0 0 16px 16px;
          }

          .profile-avatar {
            width: 120px;
            height: 120px;
          }

          .profile-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .followers-count {
            width: 100%;
          }

          .follow-button {
            width: 100%;
            justify-content: center;
          }

          .sales-stats {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .stat-box {
            flex-direction: row;
            justify-content: space-between;
            padding: 1rem;
            text-align: left;
          }

          .stat-icon {
            margin: 0 1rem 0 0;
            font-size: 1.2rem;
          }

          .stat-box .number {
            font-size: 1.2rem;
            margin: 0;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }

          .profile-actions-mobile {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
            margin-bottom: 1.5rem;
            padding: 0.8rem;
            background: var(--bg-secondary);
            border-radius: 12px;
            border: 1px solid var(--border-color);
          }

          .profile-actions-mobile .followers-count {
            margin: 0;
            padding: 0.5rem 1rem;
            background: var(--bg-primary);
            border-radius: 8px;
          }
          
          .profile-actions-mobile .follow-button {
            flex: 1;
            max-width: 150px;
            margin: 0;
          }
        }

        /* ===== Côté droit (pour desktop) ===== */
        @media (min-width: 769px) {
          .profile-actions-mobile {
            display: flex;
            max-width: 400px;
            margin: 0 auto 2rem;
          }
        }
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 20px;
          background-color: var(--primary);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .follow-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .follow-button.following {
          background-color: var(--success);
        }

        .followers-count {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .followers-count .count {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .followers-count .label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .sales-stats {
          display: flex;
          justify-content: space-around;
          margin-bottom: 2rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem 1rem;
        }

        .stat-box .number {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.3rem;
        }

        .stat-box .label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .rating-stars {
          color: #ffd700;
          font-size: 1.2rem;
          letter-spacing: 2px;
          margin: 0.5rem 0;
        }

        .rating-stars .star {
          position: relative;
          display: inline-block;
          color: #e0e0e0;
        }

        .rating-stars .star.filled {
          color: #ffd700;
        }

        .rating-stars .star.half::before {
          content: '★';
          position: absolute;
          left: 0;
          width: 50%;
          overflow: hidden;
          color: #ffd700;
        }

        .success-bar {
          width: 100%;
          height: 6px;
          background-color: #e0e0e0;
          border-radius: 3px;
          margin-top: 8px;
          overflow: hidden;
        }

        .success-progress {
          height: 100%;
          background-color: var(--success);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .nav-item.no-dropdown .nav-trigger.no-dropdown {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 2rem 0;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 2rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          background-color: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          color: var(--text-muted);
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .email {
          color: var(--text-muted);
          margin: 0 0 1.5rem 0;
        }

        .stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--primary);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .profile-section {
          margin-bottom: 3rem;
        }

        .profile-section h2 {
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .about-text {
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .no-items {
          color: var(--text-muted);
          font-style: italic;
          grid-column: 1 / -1;
          text-align: center;
          padding: 2rem 0;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .stats {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
