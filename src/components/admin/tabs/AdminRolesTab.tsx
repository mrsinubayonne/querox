import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
import RolesManager from '@/components/admin/RolesManager';

export const AdminRolesTab: React.FC = () => {
  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          Gestion des Rôles
        </CardTitle>
        <CardDescription>
          Configurez les permissions et les rôles des utilisateurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RolesManager />
      </CardContent>
    </Card>
  );
};
