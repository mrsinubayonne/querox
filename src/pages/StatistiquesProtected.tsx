import React from 'react';
import ProtectedAccessRoute from '@/components/ProtectedAccessRoute';
import Statistiques from './Statistiques';

const StatistiquesProtected: React.FC = () => {
  return (
    <ProtectedAccessRoute
      type="accounting"
      title="Accès aux Statistiques"
      description="Veuillez entrer votre code d'accès pour accéder aux statistiques"
    >
      <Statistiques />
    </ProtectedAccessRoute>
  );
};

export default StatistiquesProtected;
