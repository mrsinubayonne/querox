import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key } from 'lucide-react';
import AccessCodesManager from '@/components/admin/AccessCodesManager';

export const AdminAccessCodesTab: React.FC = () => {
  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Codes d'Accès
        </CardTitle>
        <CardDescription>
          Gérez les codes d'accès pour les profils
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AccessCodesManager />
      </CardContent>
    </Card>
  );
};
