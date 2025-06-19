
import React from 'react';
import { Crown } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail }) => {
  return (
    <div className="mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
        <Crown className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900">
        Administration des Abonnements
      </h1>
      <p className="text-gray-600 mt-2">
        Gérez manuellement les abonnements et accès aux fonctionnalités premium
      </p>
      <div className="mt-2 text-sm text-green-600 font-medium">
        ✓ Connecté en tant qu'administrateur: {userEmail}
      </div>
    </div>
  );
};

export default AdminHeader;
