
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  const { selectedOutletId, loading: outletsLoading } = useOutlets();
  const navigate = useNavigate();
  const location = useLocation();

  // Team members don't need outlet checks - they have direct access
  const loading = isTeamMember ? authLoading : (authLoading || (user && outletsLoading));

  useEffect(() => {
    // Ne rien faire pendant le chargement initial auth
    if (authLoading) {
      return;
    }

    // === TEAM MEMBER PATH ===
    if (isTeamMember) {
      if (!teamMemberSession) {
        // Session invalide, rediriger vers auth
        navigate('/auth', { replace: true });
        return;
      }
      // Membre d'équipe avec session valide = accès direct autorisé
      console.log('✅ Team member authenticated, allowing access to:', location.pathname);
      return;
    }

    // === REGULAR USER PATH ===
    // Attendre le chargement des outlets pour utilisateurs normaux
    if (outletsLoading) {
      return;
    }

    // Vérifier l'authentification utilisateur normal
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Ne pas rediriger si on est déjà sur les pages de sélection ou d'abonnement
    if (
      location.pathname === '/select-outlet' ||
      location.pathname === '/abonnement'
    ) {
      return;
    }

    // Vérifier outlet pour utilisateurs normaux
    const localOutletId = localStorage.getItem('selectedOutletId');
    const effectiveOutletId = selectedOutletId || localOutletId;

    if (!effectiveOutletId) {
      navigate('/select-outlet', { replace: true });
      return;
    }
  }, [user, authLoading, isTeamMember, teamMemberSession, selectedOutletId, outletsLoading, navigate, location.pathname]);

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
