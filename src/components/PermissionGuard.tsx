import React from 'react';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback,
  children
}) => {
  const { loading, hasPermission, hasAnyPermission, hasAllPermissions } = useTeamPermissions();

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  
  let hasAccess = false;
  if (requireAll) {
    hasAccess = hasAllPermissions(permissions);
  } else {
    hasAccess = permissions.length === 1 
      ? hasPermission(permissions[0]) 
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Accès non autorisé</AlertTitle>
        <AlertDescription>
          Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
