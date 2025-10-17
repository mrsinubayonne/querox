import React, { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import GeneralSettingsTab from '@/components/menu-management/GeneralSettingsTab';
import { useMenus } from '@/hooks/useMenus';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Menu, Edit, Trash2, Eye, EyeOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MenuItem } from '@/hooks/useMenus';

// Interface pour le modal d'édition (compatible avec l'ancien format)
interface EditableMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  isActive: boolean;
  is_available: boolean;
}

const MenuItemManager: React.FC<{ activeMenuId?: string }> = ({ activeMenuId }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableMenuItem | null>(null);
  
  const { items, categories, loading, refetch } = useMenus();
  const { toggleAvailability, deleteMenuItem } = useMenuItems();

  const itemsToShow = activeMenuId
    ? items.filter((it) => {
        const cat = categories.find((c) => c.id === it.category_id);
        return cat?.menu_id === activeMenuId;
      })
    : items;

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

  const handleEditItem = (item: MenuItem) => {
    // Transform the item to match EditableMenuItem interface
    const editableItem: EditableMenuItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      category: item.category_name,
      isActive: item.is_available,
      is_available: item.is_available
    };
    setEditingItem(editableItem);
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

  const MenuItemsContent = () => {
    if (itemsToShow.length === 0) {
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
            <h2 className="text-2xl font-bold">Mes Plats ({itemsToShow.length})</h2>
            <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
              <Menu className="w-4 h-4 mr-2" />
              Ajouter un plat
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsToShow.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <SafeImage
                    src={item.image_url || APP_CONFIG.images.defaultMenuItem}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                    <Badge variant={item.is_available ? "default" : "secondary"}>
                      {item.is_available ? "Disponible" : "Indisponible"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{item.category_name}</p>
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
                      onClick={() => handleToggleAvailability(item.id, item.is_available)}
                    >
                      {item.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

  return (
    <Tabs defaultValue="items" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="items" className="flex items-center gap-2">
          <Menu className="w-4 h-4" />
          Plats
        </TabsTrigger>
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Général
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="items">
        <MenuItemsContent />
      </TabsContent>
      
      <TabsContent value="general">
        <GeneralSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default MenuItemManager;