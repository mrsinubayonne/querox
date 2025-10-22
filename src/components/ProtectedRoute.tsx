
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';

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
  const navigate = useNavigate();
  const location = useLocation();

  const loading = authLoading || profileLoading || subscriptionLoading;

  useEffect(() => {
    // Rediriger vers la page d'authentification si non connecté
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // Si l'utilisateur est connecté, a un abonnement actif mais n'a pas de selected_outlet_id
    // et qu'il n'est pas déjà sur la page select-outlet ou abonnement
    if (
      !profileLoading && 
      !subscriptionLoading && 
      user && 
      isSubscriptionActive && 
      !profile?.selected_outlet_id && 
      location.pathname !== '/select-outlet' && 
      location.pathname !== '/abonnement'
    ) {
      navigate('/select-outlet');
    }
  }, [user, authLoading, profile, profileLoading, isSubscriptionActive, subscriptionLoading, navigate, location.pathname]);

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
