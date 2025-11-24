
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

  const loading = authLoading || (user && (profilesLoading || outletsLoading));

  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (authLoading || profilesLoading || outletsLoading) {
      return;
    }

    // Étape 1: Vérifier l'authentification
    if (!user) {
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

    // Récupérer les sélections depuis localStorage
    const localProfileId = localStorage.getItem('selectedProfileId');
    const localOutletId = localStorage.getItem('selectedOutletId');
    const effectiveProfileId = selectedProfileId || localProfileId;
    const effectiveOutletId = selectedOutletId || localOutletId;

    // Special handling for team members with outlet_id
    if (isTeamMember && teamMemberSession?.outletId) {
      // Team member has an assigned outlet, ensure it's set
      if (localOutletId !== teamMemberSession.outletId) {
        localStorage.setItem('selectedOutletId', teamMemberSession.outletId);
      }
      // If team member is on selection pages, redirect to dashboard
      if (location.pathname === '/select-profile' || location.pathname === '/select-outlet') {
        navigate('/dashboard', { replace: true });
        return;
      }
      // Team members don't need profile/outlet selection for other pages
    } else {
      // Normal user flow - check for profile and outlet
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
  }, [user, authLoading, selectedProfileId, profilesLoading, selectedOutletId, outletsLoading, navigate, location.pathname, isTeamMember, teamMemberSession]);

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
