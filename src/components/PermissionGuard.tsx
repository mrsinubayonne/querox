import React from 'react';
import { useOutletRole } from '@/hooks/useOutletRole';
import { useProfile } from '@/hooks/useProfile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback,
  children
}) => {
  const { profile } = useProfile();
  const { loading, hasPermission } = useOutletRole(profile?.selected_outlet_id || undefined);

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  const hasAccess = hasPermission(permission as any);

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
