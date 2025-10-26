import React from 'react';
import ProtectedAccessRoute from '@/components/ProtectedAccessRoute';
import Menus from './Menus';

const MenusProtected: React.FC = () => {
  return (
    <ProtectedAccessRoute
      type="management"
      title="Accès aux Menus"
      description="Veuillez entrer votre code d'accès pour accéder à la gestion des menus"
    >
      <Menus />
    </ProtectedAccessRoute>
  );
};

export default MenusProtected;
