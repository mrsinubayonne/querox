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

interface Menu {
  id: string;
  name: string;
  outlet_id?: string;
}

interface TransferMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (menuIds: string[]) => Promise<void>;
  itemName: string;
  menus: Menu[];
  currentMenuId: string;
  isBulkTransfer?: boolean;
}

const TransferMenuItemModal: React.FC<TransferMenuItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  menus,
  currentMenuId,
  isBulkTransfer = false,
}) => {
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const availableMenus = useMemo(() => {
    return menus.filter(menu => menu.id !== currentMenuId);
  }, [menus, currentMenuId]);

  const toggleMenu = (menuId: string) => {
    setSelectedMenuIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const handleConfirm = async () => {
    if (selectedMenuIds.size === 0) return;
    
    setIsLoading(true);
    try {
      await onConfirm(Array.from(selectedMenuIds));
      setSelectedMenuIds(new Set());
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMenuIds(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager {isBulkTransfer ? 'les plats' : 'le plat'}</DialogTitle>
          <DialogDescription>
            {isBulkTransfer 
              ? "Copier les plats sélectionnés vers les menus de votre choix"
              : `Copier "${itemName}" vers les menus de votre choix`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Sélectionner les menus de destination
            </Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableMenus.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Aucun autre menu disponible
                </div>
              ) : (
                availableMenus.map((menu) => (
                  <label
                    key={menu.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMenuIds.has(menu.id)}
                      onChange={() => toggleMenu(menu.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">{menu.name}</span>
                  </label>
                ))
              )}
            </div>
            {selectedMenuIds.size > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedMenuIds.size} menu{selectedMenuIds.size > 1 ? 's' : ''} sélectionné{selectedMenuIds.size > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedMenuIds.size === 0 || isLoading}
          >
            {isLoading ? 'Partage...' : 'Partager'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMenuItemModal;
