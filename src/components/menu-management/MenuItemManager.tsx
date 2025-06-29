
import React, { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import { useOptimizedMenus } from '@/hooks/useOptimizedMenus';
import { useOptimizedMenuItems } from '@/hooks/useOptimizedMenuItems';
import { Menu, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Utiliser le type global MenuItem au lieu d'un type local
import { MenuItem } from '@/types/menu';

interface LocalMenuItem extends Omit<MenuItem, 'category_name'> {
  category: string;
  isActive: boolean;
}

const MenuItemManager: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LocalMenuItem | null>(null);
  
  const { items, loading, refetch } = useOptimizedMenus();
  const { toggleAvailability, deleteMenuItem } = useOptimizedMenuItems();

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleModalSuccess = async () => {
    await refetch();
    setShowAddModal(false);
  };

  const handleEditSuccess = async () => {
    await refetch();
    setEditingItem(null);
  };

  const handleToggleAvailability = async (id: string, isActive: boolean) => {
    const success = await toggleAvailability(id, !isActive);
    if (success) {
      await refetch();
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      const success = await deleteMenuItem(id);
      if (success) {
        await refetch();
      }
    }
  };

  const handleEditItem = (item: any) => {
    // Transform the item to match LocalMenuItem interface
    const localMenuItem: LocalMenuItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image,
      category: item.category,
      isActive: item.isActive,
      is_available: item.isActive
    };
    setEditingItem(localMenuItem);
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

  if (items.length === 0) {
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
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mes Plats ({items.length})</h2>
          <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
            <Menu className="w-4 h-4 mr-2" />
            Ajouter un plat
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={item.image || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Disponible" : "Indisponible"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{item.category}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                {item.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-green-600">
                    {item.price.toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(item.id, item.isActive)}
                  >
                    {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AddMenuItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditMenuItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default MenuItemManager;
