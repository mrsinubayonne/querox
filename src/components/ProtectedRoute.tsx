import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOutlets } from '@/hooks/useOutlets';
import { useOutletProfile } from '@/hooks/useOutletProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresSubscription = false,
}) => {
  const { user, loading: authLoading, isTeamMember, teamMemberSession, isOfflineMode } = useAuth();
  const { selectedOutletId, loading: outletsLoading } = useOutlets();
  const { hasPermission, loading: permissionsLoading } = useOutletProfile();
  const location = useLocation();

  void requiresSubscription;

  const loading = isTeamMember ? authLoading || permissionsLoading : authLoading || (!!user && outletsLoading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Vérification...</p>
        </div>
      </div>
    );
  }

  if (isTeamMember) {
    if (!teamMemberSession) {
      return <Navigate to="/auth" replace />;
    }
    const routePermissions: Record<string, string> = {
      '/commandes': 'orders', '/tables': 'orders', '/factures': 'invoices', '/menus': 'menus',
      '/inventaire': 'inventory', '/reservations': 'reservations', '/comptabilite': 'accounting',
      '/statistiques': 'statistics', '/rapports': 'statistics', '/clients': 'customers',
      '/equipe': 'team', '/parametres': 'settings', '/site-web': 'website', '/qr-codes': 'qrcodes',
    };
    const requiredPermission = routePermissions[location.pathname];
    if (requiredPermission && !hasPermission(requiredPermission as any)) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  const hasForcedOfflineMode = typeof window !== 'undefined' && localStorage.getItem('querox_force_offline_mode') === '1';
  const hasOfflineAccess = !!user || isOfflineMode || hasForcedOfflineMode;

  if (!hasOfflineAccess) {
    return <Navigate to="/auth" replace />;
  }

  if (location.pathname === '/select-outlet' || location.pathname === '/abonnement') {
    return <>{children}</>;
  }

  const localOutletId = typeof window !== 'undefined' ? localStorage.getItem('selectedOutletId') : null;
  const effectiveOutletId = selectedOutletId || localOutletId;

  if (!effectiveOutletId) {
    return <Navigate to="/select-outlet" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
