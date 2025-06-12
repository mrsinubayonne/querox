
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import MenuHeader from '@/components/MenuHeader';
import MenuCard from '@/components/MenuCard';
import EmptyState from '@/components/EmptyState';
import ViewItemModal from '@/components/ViewItemModal';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import { useMenus } from '@/hooks/useMenus';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useToast } from '@/hooks/use-toast';
import { Menu } from 'lucide-react';

const Menus: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { items, loading, refetch } = useMenus();
  const { toggleAvailability, deleteMenuItem } = useMenuItems();
  const { toast } = useToast();

  const handleVisitorView = () => {
    toast({
      title: "Vue visiteur",
      description: "Ouverture de la vue publique du menu",
    });
  };

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

  const handleViewItem = (item: any) => {
    setViewItem(item);
  };

  const handleEditItem = (item: any) => {
    setEditItem(item);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      const success = await deleteMenuItem(itemId);
      if (success) {
        refetch();
      }
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  // Transform real data to match expected format
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
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Chargement des plats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <MenuHeader onVisitorView={handleVisitorView} onAddItem={handleAddItem} />
          
          {transformedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transformedItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onToggleStatus={handleToggleStatus}
                  onViewItem={handleViewItem}
                  onEditItem={handleEditItem}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Menu}
              title="Aucun plat configuré"
              description="Commencez par ajouter vos premiers plats à votre menu"
              actionLabel="Ajouter un plat"
              onAction={handleAddItem}
            />
          )}
        </div>
      </div>

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
    </div>
  );
};

export default Menus;
