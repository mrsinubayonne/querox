
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { useOutlets } from '@/hooks/useOutlets';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresSubscription = false 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isSubscriptionActive, loading: subscriptionLoading } = useSubscription();
  const { selectedProfileId, profiles, loading: profilesLoading } = useUserProfiles();
  const { selectedOutletId, loading: outletsLoading } = useOutlets();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = authLoading || (user && (profileLoading || subscriptionLoading || profilesLoading || outletsLoading));

  useEffect(() => {
    // Étape 1: Vérifier l'authentification
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // Ne pas rediriger si on est déjà sur les pages de sélection ou d'abonnement
    if (
      location.pathname === '/select-profile' || 
      location.pathname === '/select-outlet' ||
      location.pathname === '/abonnement'
    ) {
      return;
    }

    // Étape 2: Vérifier qu'un profil est sélectionné (OBLIGATOIRE avant outlet)
    if (!profilesLoading && user && !selectedProfileId) {
      navigate('/select-profile');
      return;
    }

    // Étape 3: Vérifier qu'un outlet est sélectionné (seulement après avoir un profil)
    if (
      !profilesLoading && 
      !subscriptionLoading && 
      user && 
      selectedProfileId &&
      isSubscriptionActive
    ) {
      if (!selectedOutletId) {
        navigate('/select-outlet');
        return;
      }
    }
  }, [user, authLoading, profile, profileLoading, isSubscriptionActive, subscriptionLoading, selectedProfileId, profiles, profilesLoading, selectedOutletId, outletsLoading, navigate, location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // Don't render content if user is not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
