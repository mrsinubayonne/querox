
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MenuHeaderProps {
  onAddItem: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ onAddItem }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Menus</h1>
        <p className="text-gray-600">Gérez vos plats, prix et disponibilité</p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          onClick={onAddItem}
        >
          <Plus size={16} />
          Ajouter un plat
        </Button>
      </div>
    </div>
  );
};

export default MenuHeader;
