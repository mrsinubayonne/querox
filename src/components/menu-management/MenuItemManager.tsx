import React, { useState, useEffect } from 'react';
import EmptyState from '@/components/EmptyState';
import AddMenuItemModal from '@/components/AddMenuItemModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import TransferMenuItemModal from '@/components/TransferMenuItemModal';

import { useMenus, Menu, MenuCategory } from '@/hooks/useMenus';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useOutlets } from '@/hooks/useOutlets';
import { Menu as MenuIcon, Edit, Trash2, Eye, EyeOff, ArrowRightLeft, Search, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SafeImage from '@/components/SafeImage';
import { APP_CONFIG } from '@/config/app.config';

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
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [allCategories, setAllCategories] = useState<MenuCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<string | null>(null);
  
  const { items, categories, menus, loading, refetch, fetchAllMenus, fetchAllCategories } = useMenus();
  const { toggleAvailability, deleteMenuItem, shareMenuItems } = useMenuItems();
  const { outlets } = useOutlets();

  // Charger tous les menus et catégories pour le modal de transfert
  useEffect(() => {
    const loadAllData = async () => {
      const [menusData, categoriesData] = await Promise.all([
        fetchAllMenus(),
        fetchAllCategories()
      ]);
      setAllMenus(menusData);
      setAllCategories(categoriesData);
    };
    loadAllData();
  }, [fetchAllMenus, fetchAllCategories]);

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

  // Grouper les items par catégorie
  const categoriesToShow = activeMenuId 
    ? categories.filter(cat => cat.menu_id === activeMenuId)
    : categories;

  const itemsByCategory = categoriesToShow.reduce((acc, category) => {
    acc[category.id] = filteredItems.filter(item => item.category_id === category.id);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  // Ouvrir automatiquement toutes les catégories lors du premier chargement
  React.useEffect(() => {
    if (categoriesToShow.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categoriesToShow.map(cat => cat.id)));
    }
  }, [categoriesToShow.length]);

  // Ouvrir toutes les catégories lors d'une recherche
  React.useEffect(() => {
    if (searchTerm.trim() !== '') {
      setExpandedCategories(new Set(categoriesToShow.map(cat => cat.id)));
    }
  }, [searchTerm]);

  const handleAddItem = (categoryId?: string) => {
    setSelectedCategoryForAdd(categoryId || null);
    setShowAddModal(true);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
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

  const handleTransferClick = (item: MenuItem) => {
    setTransferringItem(item);
  };

  const handleTransferConfirm = async (outletIds: string[]) => {
    if (!transferringItem) return;
    const success = await shareMenuItems([transferringItem.id], outletIds);
    if (success) {
      await refetch();
      setTransferringItem(null);
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
      setSelectedItems(new Set(itemsToShow.map(item => item.id)));
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
      await refetch();
      setSelectedItems(new Set());
      setShowBulkTransfer(false);
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
    if (categoriesToShow.length === 0) {
      return (
        <>
          <div className="mt-6">
            <EmptyState
              icon={MenuIcon}
              title="Aucune catégorie"
              description="Commencez par créer des catégories pour organiser votre menu"
              actionLabel="Gérer les catégories"
              onAction={() => {}}
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

          {/* Affichage par catégories */}
          <div className="space-y-4">
            {categoriesToShow.map((category) => {
              const categoryItems = itemsByCategory[category.id] || [];
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                  className="border rounded-lg"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {categoryItems.length} plat{categoryItems.length !== 1 ? 's' : ''}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddItem(category.id);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter un plat
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    {categoryItems.length === 0 ? (
                      <div className="p-8 text-center border-t">
                        <p className="text-muted-foreground mb-4">Aucun plat dans cette catégorie</p>
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(category.id)}
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter le premier plat
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden relative">
                              <div className="absolute top-3 left-3 z-10">
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                                  className="bg-white border-2"
                                />
                              </div>
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
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        <AddMenuItemModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedCategoryForAdd(null);
          }}
          onSuccess={handleModalSuccess}
          activeMenuId={activeMenuId}
          defaultCategoryId={selectedCategoryForAdd}
        />

        <EditMenuItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleEditSuccess}
        />

        {transferringItem && (
          <TransferMenuItemModal
            isOpen={!!transferringItem}
            onClose={() => setTransferringItem(null)}
            onConfirm={handleTransferConfirm}
            itemName={transferringItem.name}
            outlets={outlets}
            currentOutletId={menus.find(m => categories.find(c => c.id === transferringItem.category_id)?.menu_id === m.id)?.outlet_id || ''}
          />
        )}

        {showBulkTransfer && (
          <TransferMenuItemModal
            isOpen={showBulkTransfer}
            onClose={() => setShowBulkTransfer(false)}
            onConfirm={handleBulkTransferConfirm}
            itemName={`${selectedItems.size} plat${selectedItems.size > 1 ? 's' : ''}`}
            outlets={outlets}
            currentOutletId={menus[0]?.outlet_id || ''}
            isBulkTransfer
          />
        )}
      </>
    );
  };

  return (
    <MenuItemsContent />
  );
};

export default MenuItemManager;