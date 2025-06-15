import React, { useState } from 'react';
import MenuCard from '@/components/MenuCard';
import EmptyState from '@/components/EmptyState';
import ViewItemModal from '@/components/ViewItemModal';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import { useMenus } from '@/hooks/useMenus';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Menu } from 'lucide-react';

const MenuItemManager: React.FC = () => {
  const [viewItem, setViewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { items, loading, refetch } = useMenus();
  const { toggleAvailability, deleteMenuItem } = useMenuItems();

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleToggleStatus = async (itemId: string | number) => {
    const item = transformedItems.find(i => i.id === itemId);
    if (item) {
      const success = await toggleAvailability(String(itemId), !item.isActive);
      if (success) {
        refetch();
      }
    }
  };

  const handleDeleteItem = async (itemId: string | number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      const success = await deleteMenuItem(String(itemId));
      if (success) {
        refetch();
      }
    }
  };

  const handleModalSuccess = () => {
    refetch();
    setShowAddModal(false);
    setEditItem(null);
  };
  
  const transformedItems = items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: `${item.price.toLocaleString('fr-FR')} FCFA`,
    status: item.isActive ? "Disponible" : "Non disponible",
    description: item.description || '',
    image: item.image || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png",
    isActive: item.isActive,
    allergens: item.allergens
  }));

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
      {transformedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {transformedItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onToggleStatus={handleToggleStatus}
              onViewItem={setViewItem}
              onEditItem={setEditItem}
              onDeleteItem={handleDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Menu}
            title="Aucun plat configuré"
            description="Commencez par ajouter vos premiers plats à votre menu"
            actionLabel="Ajouter un plat"
            onAction={handleAddItem}
          />
        </div>
      )}

      <ViewItemModal
        item={viewItem}
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
      />

      <AddMenuItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditMenuItemModal
        item={editItem}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default MenuItemManager;
