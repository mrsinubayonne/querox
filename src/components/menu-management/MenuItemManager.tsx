import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import EmptyState from '@/components/EmptyState';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import TransferMenuItemModal from '@/components/TransferMenuItemModal';
import ImportMenuFromImageModal from './ImportMenuFromImageModal';

import { useMenus, Menu, MenuCategory } from '@/hooks/useMenus';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useOutlets } from '@/hooks/useOutlets';
import { Menu as MenuIcon, Edit, Trash2, Eye, EyeOff, ArrowRightLeft, Copy, Package, Image } from 'lucide-react';
import { MenuSearchBar } from './MenuSearchBar';
import MenuItemIngredientsModal from './MenuItemIngredientsModal';
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableMenuItem | null>(null);
  const [transferringItem, setTransferringItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkTransfer, setShowBulkTransfer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [ingredientsModalItem, setIngredientsModalItem] = useState<{ id: string; name: string } | null>(null);
  
  const { items, categories, menus, loading, refetch, fetchAllMenus, applyLocalItemUpdate, applyLocalItemRemove } = useMenus();
  const { toggleAvailability, deleteMenuItem, shareMenuItems, addMenuItem } = useMenuItems();
  const { outlets } = useOutlets();
  
  const [allMenus, setAllMenus] = useState<Menu[]>([]);

  // Charger tous les menus pour le transfert
  useEffect(() => {
    const loadAllMenus = async () => {
      const menusData = await fetchAllMenus();
      setAllMenus(menusData || []);
    };
    loadAllMenus();
  }, [fetchAllMenus]);

  const itemsToShow = useMemo(() => {
    if (!activeMenuId) return items;
    return items.filter((it) => {
      const cat = categories.find((c) => c.id === it.category_id);
      return cat?.menu_id === activeMenuId;
    });
  }, [items, categories, activeMenuId]);

  // Filtrer par recherche avec useMemo pour éviter les re-calculs
  const filteredItems = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();
    if (query === '') return itemsToShow;

    return itemsToShow.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      item.category_name.toLowerCase().includes(query)
    );
  }, [itemsToShow, deferredSearchTerm]);

  // Pagination avec useMemo
  const totalPages = useMemo(() => Math.ceil(filteredItems.length / itemsPerPage), [filteredItems.length]);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddItem = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleModalSuccess = useCallback(async () => {
    setShowAddModal(false);
    await refetch();
  }, [refetch]);

  const handleEditSuccess = useCallback(async () => {
    setEditingItem(null);
    await refetch();
  }, [refetch]);

  const handleToggleAvailability = useCallback(async (id: string, isActive: boolean) => {
    // Optimiste : flip immédiat
    applyLocalItemUpdate(id, { is_available: !isActive });
    const ok = await toggleAvailability(id, !isActive);
    if (!ok) applyLocalItemUpdate(id, { is_available: isActive });
    else refetch();
  }, [toggleAvailability, refetch, applyLocalItemUpdate]);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      // Optimiste : retirer de la grille immédiatement
      applyLocalItemRemove(id);
      const ok = await deleteMenuItem(id);
      if (!ok) refetch(); // restore en cas d'échec
    }
  }, [deleteMenuItem, refetch, applyLocalItemRemove]);

  const handleEditItem = useCallback((item: MenuItem) => {
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
  }, []);

  const handleTransferClick = useCallback((item: MenuItem) => {
    setTransferringItem(item);
  }, []);

  const handleTransferConfirm = useCallback(async (menuIds: string[]) => {
    if (!transferringItem) return;
    const success = await shareMenuItems([transferringItem.id], menuIds);
    if (success) {
      setTransferringItem(null);
      await refetch();
    }
  }, [transferringItem, shareMenuItems, refetch]);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(itemId);
      } else {
        newSelected.delete(itemId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  }, [paginatedItems]);

  const handleBulkTransferClick = useCallback(() => {
    setShowBulkTransfer(true);
  }, []);

  const handleBulkTransferConfirm = useCallback(async (menuIds: string[]) => {
    const success = await shareMenuItems(Array.from(selectedItems), menuIds);
    if (success) {
      setSelectedItems(new Set());
      setShowBulkTransfer(false);
      await refetch();
    }
  }, [selectedItems, shareMenuItems, refetch]);

  const handleDuplicateItem = useCallback(async (item: MenuItem) => {
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
  }, [addMenuItem, refetch]);

  // Handler pour le changement de recherche
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

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
          {/* Nouvelle barre de recherche isolée (focus stable, debounce intégré) */}
          <MenuSearchBar onChange={setSearchTerm} />
          {searchTerm.trim() !== '' && (
            <p className="text-sm text-muted-foreground -mt-2 ml-1">
              {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
            </p>
          )}

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
              <Button 
                onClick={() => setShowImportModal(true)} 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Image className="w-4 h-4 mr-2" />
                Importer depuis une image
              </Button>
              <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                <MenuIcon className="w-4 h-4 mr-2" />
                Ajouter un plat
              </Button>
            </div>
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
                      onClick={() => setIngredientsModalItem({ id: item.id, name: item.name })}
                      title="Gérer les ingrédients"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <Package className="w-4 h-4" />
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
      {MenuItemsContent()}



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
        menus={allMenus}
        outlets={outlets}
        currentMenuId={transferringItem ? (categories.find(c => c.id === transferringItem.category_id)?.menu_id || '') : ''}
        currentOutletId={transferringItem ? (menus.find(m => categories.find(c => c.id === transferringItem.category_id)?.menu_id === m.id)?.outlet_id || '') : ''}
      />

      <TransferMenuItemModal
        isOpen={showBulkTransfer}
        onClose={() => setShowBulkTransfer(false)}
        onConfirm={handleBulkTransferConfirm}
        itemName={`${selectedItems.size} plat${selectedItems.size > 1 ? 's' : ''}`}
        menus={allMenus}
        outlets={outlets}
        currentMenuId={activeMenuId || menus[0]?.id || ''}
        currentOutletId={menus.find(m => m.id === activeMenuId)?.outlet_id || menus[0]?.outlet_id || ''}
        isBulkTransfer
      />

      {ingredientsModalItem && (
        <MenuItemIngredientsModal
          isOpen={!!ingredientsModalItem}
          onClose={() => setIngredientsModalItem(null)}
          menuItemId={ingredientsModalItem.id}
          menuItemName={ingredientsModalItem.name}
        />
      )}

      {activeMenuId && (
        <ImportMenuFromImageModal
          open={showImportModal}
          onOpenChange={setShowImportModal}
          menuId={activeMenuId}
          onImportComplete={refetch}
        />
      )}
    </>
  );
};

export default MenuItemManager;