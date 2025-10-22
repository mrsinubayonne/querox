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

interface TransferMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryId: string) => Promise<void>;
  itemName: string;
  menus: Menu[];
  categories: MenuCategory[];
  currentCategoryId: string;
}

const TransferMenuItemModal: React.FC<TransferMenuItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  menus,
  categories,
  currentCategoryId,
}) => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const availableCategories = useMemo(() => {
    if (!selectedMenuId) return [];
    return categories.filter(cat => 
      cat.menu_id === selectedMenuId && cat.id !== currentCategoryId
    );
  }, [selectedMenuId, categories, currentCategoryId]);

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
    setSelectedMenuId('');
    setSelectedCategoryId('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transférer le plat</DialogTitle>
          <DialogDescription>
            Transférer "{itemName}" vers une autre catégorie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Menu de destination
            </Label>
            <Select value={selectedMenuId} onValueChange={handleMenuChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un menu" />
              </SelectTrigger>
              <SelectContent>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
