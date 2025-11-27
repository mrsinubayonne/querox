
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, loading: authLoading, isTeamMember, teamMemberSession } = useAuth();
  const { selectedProfileId, profiles, loading: profilesLoading } = useUserProfiles();
  const { selectedOutletId, loading: outletsLoading } = useOutlets();
  const navigate = useNavigate();
  const location = useLocation();

  // Team members don't need profile/outlet checks - they have direct access
  const loading = isTeamMember ? authLoading : (authLoading || (user && (profilesLoading || outletsLoading)));

  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (authLoading) {
      return;
    }

    // Special handling for team members
    if (isTeamMember && teamMemberSession) {
      console.log('✅ Team member authenticated, allowing access');
      // Team members have direct access - no profile/outlet checks needed
      // Their outlet is already in their session
      return;
    }

    // For regular users, check loading states
    if (profilesLoading || outletsLoading) {
      return;
    }

    // Étape 1: Vérifier l'authentification (user OU team member)
    if (!user && !isTeamMember) {
      navigate('/auth', { replace: true });
      return;
    }

    // If team member but no session, redirect to auth
    if (isTeamMember && !teamMemberSession) {
      navigate('/auth', { replace: true });
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

    // For regular users (not team members), check profile and outlet
    if (!isTeamMember) {
      // Récupérer les sélections depuis localStorage
      const localProfileId = localStorage.getItem('selectedProfileId');
      const localOutletId = localStorage.getItem('selectedOutletId');
      const effectiveProfileId = selectedProfileId || localProfileId;
      const effectiveOutletId = selectedOutletId || localOutletId;

      // Étape 2: Vérifier qu'un profil est sélectionné
      if (!effectiveProfileId) {
        navigate('/select-profile', { replace: true });
        return;
      }

      // Étape 3: Vérifier qu'un outlet est sélectionné
      if (!effectiveOutletId) {
        navigate('/select-outlet', { replace: true });
        return;
      }
    }
  }, [user, authLoading, isTeamMember, teamMemberSession, selectedProfileId, profilesLoading, selectedOutletId, outletsLoading, navigate, location.pathname]);

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

  // Don't render content if neither user nor team member is authenticated
  if (!user && !isTeamMember) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
