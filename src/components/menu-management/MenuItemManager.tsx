import React, { useState, useEffect } from 'react';
import EmptyState from '@/components/EmptyState';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import TransferMenuItemModal from '@/components/TransferMenuItemModal';

import { useMenus, Menu, MenuCategory } from '@/hooks/useMenus';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useOutlets } from '@/hooks/useOutlets';
import { Menu as MenuIcon, Edit, Trash2, Eye, EyeOff, ArrowRightLeft, Search, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import SafeImage from '@/components/SafeImage';
import { getCategoryDefaultImage } from '@/utils/categoryImages';

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
  const [transferringItem, setTransferringItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkTransfer, setShowBulkTransfer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const { items, categories, menus, loading, refetch } = useMenus();
  const { toggleAvailability, deleteMenuItem, shareMenuItems, addMenuItem } = useMenuItems();
  const { outlets } = useOutlets();

  const itemsToShow = activeMenuId
    ? items.filter((it) => {
        const cat = categories.find((c) => c.id === it.category_id);
        return cat?.menu_id === activeMenuId;
      })
    : items;

  // Filtrer par recherche
  const filteredItems = searchTerm.trim() === '' 
    ? itemsToShow 
    : itemsToShow.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleModalSuccess = async () => {
    setShowAddModal(false);
    await refetch();
  };

  const handleEditSuccess = async () => {
    setEditingItem(null);
    await refetch();
  };

  const handleToggleAvailability = async (id: string, isActive: boolean) => {
    await toggleAvailability(id, !isActive);
    await refetch();
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      await deleteMenuItem(id);
      await refetch();
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

  const handleTransferClick = (item: MenuItem) => {
    setTransferringItem(item);
  };

  const handleTransferConfirm = async (outletIds: string[]) => {
    if (!transferringItem) return;
    const success = await shareMenuItems([transferringItem.id], outletIds);
    if (success) {
      setTransferringItem(null);
      await refetch();
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkTransferClick = () => {
    setShowBulkTransfer(true);
  };

  const handleBulkTransferConfirm = async (outletIds: string[]) => {
    const success = await shareMenuItems(Array.from(selectedItems), outletIds);
    if (success) {
      setSelectedItems(new Set());
      setShowBulkTransfer(false);
      await refetch();
    }
  };

  const handleDuplicateItem = async (item: MenuItem) => {
    const success = await addMenuItem({
      name: `${item.name} (copie)`,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      image_url: item.image_url,
      is_available: item.is_available,
      allergens: item.allergens || [],
      order_index: item.order_index
    });
    if (success) {
      await refetch();
    }
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
    if (itemsToShow.length === 0 && searchTerm.trim() === '') {
      return (
        <>
          <div className="mt-6">
            <EmptyState
              icon={MenuIcon}
              title="Aucun plat configuré"
              description="Commencez par ajouter vos premiers plats à votre menu"
              actionLabel="Ajouter un plat"
              onAction={handleAddItem}
            />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Mes Plats ({itemsToShow.length})</h2>
              {selectedItems.size > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {selectedItems.size} sélectionné{selectedItems.size > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {selectedItems.size > 0 && (
                <Button 
                  onClick={handleBulkTransferClick} 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Partager la sélection
                </Button>
              )}
              <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                <MenuIcon className="w-4 h-4 mr-2" />
                Ajouter un plat
              </Button>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un plat par nom, description ou catégorie..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredItems.length === 0 && searchTerm.trim() !== '' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun plat trouvé pour "{searchTerm}"</p>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="flex items-center gap-2 py-2 border-b">
              <Checkbox
                checked={selectedItems.size === paginatedItems.length && paginatedItems.length > 0 && paginatedItems.every(item => selectedItems.has(item.id))}
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Tout sélectionner {searchTerm.trim() !== '' && `(${filteredItems.length} résultat${filteredItems.length > 1 ? 's' : ''})`}
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((item) => (
              <Card key={item.id} className="overflow-hidden relative">
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    className="bg-white border-2"
                  />
                </div>
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.image_url || getCategoryDefaultImage(item.category_name)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
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

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                      className="flex-1 min-w-[100px]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateItem(item)}
                      title="Dupliquer ce plat"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransferClick(item)}
                      title="Partager avec d'autres points de vente"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>

      </>
    );
  };

  return (
    <>
      <MenuItemsContent />

      <AddMenuItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
        activeMenuId={activeMenuId}
      />

      <EditMenuItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={handleEditSuccess}
      />

      <TransferMenuItemModal
        isOpen={!!transferringItem}
        onClose={() => setTransferringItem(null)}
        onConfirm={handleTransferConfirm}
        itemName={transferringItem?.name || ''}
        outlets={outlets}
        currentOutletId={transferringItem ? (menus.find(m => categories.find(c => c.id === transferringItem.category_id)?.menu_id === m.id)?.outlet_id || '') : ''}
      />

      <TransferMenuItemModal
        isOpen={showBulkTransfer}
        onClose={() => setShowBulkTransfer(false)}
        onConfirm={handleBulkTransferConfirm}
        itemName={`${selectedItems.size} plat${selectedItems.size > 1 ? 's' : ''}`}
        outlets={outlets}
        currentOutletId={menus[0]?.outlet_id || ''}
        isBulkTransfer
      />
    </>
  );
};

export default MenuItemManager;