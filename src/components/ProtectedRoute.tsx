
import React, { useEffect, useState } from 'react';
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
  const { user, loading: authLoading, isTeamMember, teamMemberSession } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isSubscriptionActive, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = authLoading || (user && (profileLoading || subscriptionLoading));

  useEffect(() => {
    // Allow team members to access without Supabase auth
    if (isTeamMember && teamMemberSession) {
      // Team members bypass the selected_outlet_id check
      return;
    }

    // Rediriger vers la page d'authentification si non connecté
    if (!authLoading && !user && !isTeamMember) {
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
  }, [user, authLoading, profile, profileLoading, isSubscriptionActive, subscriptionLoading, navigate, location.pathname, isTeamMember, teamMemberSession]);

  // Show loading state while checking authentication
  if (loading && !isTeamMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // Don't render content if user is not authenticated (unless team member)
  if (!user && !isTeamMember) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
