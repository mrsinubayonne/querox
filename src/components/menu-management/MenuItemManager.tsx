
import React, { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import { useMenus } from '@/hooks/useMenus';
import { Menu } from 'lucide-react';

const MenuItemManager: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { items, loading, refetch } = useMenus();

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleModalSuccess = () => {
    refetch();
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Chargement des plats...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6">
        <EmptyState
          icon={Menu}
          title="Aucun plat configuré"
          description="Commencez par ajouter vos premiers plats à votre menu"
          actionLabel="Ajouter un plat"
          onAction={handleAddItem}
        />
      </div>

      <AddMenuItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default MenuItemManager;
