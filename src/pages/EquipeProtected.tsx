import React from 'react';
import ProtectedAccessRoute from '@/components/ProtectedAccessRoute';
import Equipe from './Equipe';

const EquipeProtected: React.FC = () => {
  return (
    <ProtectedAccessRoute
      type="management"
      title="Accès à l'Équipe"
      description="Veuillez entrer votre code d'accès pour accéder à la gestion d'équipe"
    >
      <Equipe />
    </ProtectedAccessRoute>
  );
};

export default EquipeProtected;
