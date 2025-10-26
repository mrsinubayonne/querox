import React from 'react';
import ProtectedAccessRoute from '@/components/ProtectedAccessRoute';
import Inventaire from './Inventaire';

const InventaireProtected: React.FC = () => {
  return (
    <ProtectedAccessRoute
      type="accounting"
      title="Accès à l'Inventaire"
      description="Veuillez entrer votre code d'accès pour accéder à l'inventaire"
    >
      <Inventaire />
    </ProtectedAccessRoute>
  );
};

export default InventaireProtected;
