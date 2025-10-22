import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Menu, MenuCategory } from '@/hooks/useMenus';

interface Outlet {
  id: string;
  name: string;
}

interface TransferMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryId: string) => Promise<void>;
  itemName: string;
  menus: Menu[];
  categories: MenuCategory[];
  currentCategoryId: string;
  outlets: Outlet[];
  isBulkTransfer?: boolean;
}

const TransferMenuItemModal: React.FC<TransferMenuItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  menus,
  categories,
  currentCategoryId,
  outlets,
  isBulkTransfer = false,
}) => {
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const availableMenus = useMemo(() => {
    if (!selectedOutletId) return [];
    return menus.filter(menu => menu.outlet_id === selectedOutletId);
  }, [selectedOutletId, menus]);

  const availableCategories = useMemo(() => {
    if (!selectedMenuId) return [];
    return categories.filter(cat => {
      if (isBulkTransfer) {
        return cat.menu_id === selectedMenuId;
      }
      return cat.menu_id === selectedMenuId && cat.id !== currentCategoryId;
    });
  }, [selectedMenuId, categories, currentCategoryId, isBulkTransfer]);

  const handleOutletChange = (outletId: string) => {
    setSelectedOutletId(outletId);
    setSelectedMenuId('');
    setSelectedCategoryId('');
  };

  const handleMenuChange = (menuId: string) => {
    setSelectedMenuId(menuId);
    setSelectedCategoryId('');
  };

  const handleConfirm = async () => {
    if (!selectedCategoryId) return;
    
    setIsLoading(true);
    try {
      await onConfirm(selectedCategoryId);
      onClose();
      setSelectedMenuId('');
      setSelectedCategoryId('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedOutletId('');
    setSelectedMenuId('');
    setSelectedCategoryId('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transférer {isBulkTransfer ? 'les plats' : 'le plat'}</DialogTitle>
          <DialogDescription>
            Transférer "{itemName}" vers un autre point de vente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Point de vente de destination
            </Label>
            <Select value={selectedOutletId} onValueChange={handleOutletChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un point de vente" />
              </SelectTrigger>
              <SelectContent>
                {outlets.map((outlet) => (
                  <SelectItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOutletId && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Menu de destination
              </Label>
              <Select value={selectedMenuId} onValueChange={handleMenuChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un menu" />
                </SelectTrigger>
                <SelectContent>
                  {availableMenus.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      Aucun menu disponible pour ce point de vente
                    </div>
                  ) : (
                    availableMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedMenuId && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Catégorie de destination
              </Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      Aucune catégorie disponible
                    </div>
                  ) : (
                    availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedCategoryId || isLoading}
          >
            {isLoading ? 'Transfert...' : 'Transférer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMenuItemModal;
