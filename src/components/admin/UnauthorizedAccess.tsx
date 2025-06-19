
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface UnauthorizedAccessProps {
  userEmail?: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ userEmail }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Accès Restreint
            </h2>
            <p className="text-gray-600 mb-4">
              Cette interface d'administration est réservée aux administrateurs autorisés uniquement.
            </p>
            <p className="text-sm text-gray-500">
              Connecté en tant que: {userEmail || 'Non connecté'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedAccess;
