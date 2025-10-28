import React from 'react';
import ProtectedAccessRoute from '@/components/ProtectedAccessRoute';
import Comptabilite from './Comptabilite';

const ComptabiliteProtected: React.FC = () => {
  return (
    <ProtectedAccessRoute
      type="accounting"
      title="Accès à la Comptabilité"
      description="Veuillez entrer votre code d'accès pour accéder à la comptabilité"
    >
      <Comptabilite />
    </ProtectedAccessRoute>
  );
};

export default ComptabiliteProtected;
