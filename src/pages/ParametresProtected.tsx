import React from 'react';
import ProtectedAccessRoute from '@/components/ProtectedAccessRoute';
import Parametres from './Parametres';

const ParametresProtected: React.FC = () => {
  return (
    <ProtectedAccessRoute
      type="management"
      title="Accès aux Paramètres"
      description="Veuillez entrer votre code d'accès pour accéder aux paramètres"
    >
      <Parametres />
    </ProtectedAccessRoute>
  );
};

export default ParametresProtected;
