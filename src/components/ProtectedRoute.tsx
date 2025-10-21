
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

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
  const navigate = useNavigate();
  const location = useLocation();

  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // Si l'utilisateur est connecté mais n'a pas de selected_outlet_id
    // et qu'il n'est pas déjà sur la page select-outlet
    if (!profileLoading && user && !profile?.selected_outlet_id && location.pathname !== '/select-outlet') {
      navigate('/select-outlet');
    }
  }, [user, authLoading, profile, profileLoading, navigate, location.pathname]);

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
