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

interface Outlet {
  id: string;
  name: string;
}

interface TransferMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (menuIds: string[]) => Promise<void>;
  itemName: string;
  menus: Menu[];
  outlets: Outlet[];
  currentMenuId: string;
  currentOutletId: string;
  isBulkTransfer?: boolean;
}

const TransferMenuItemModal: React.FC<TransferMenuItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  menus,
  outlets,
  currentMenuId,
  currentOutletId,
  isBulkTransfer = false,
}) => {
  const [selectedOutletIds, setSelectedOutletIds] = useState<Set<string>>(new Set());
  const [selectedMenuByOutlet, setSelectedMenuByOutlet] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const availableOutlets = useMemo(() => {
    return outlets.filter(outlet => outlet.id !== currentOutletId);
  }, [outlets, currentOutletId]);

  const getMenusForOutlet = (outletId: string) => {
    return menus.filter(menu => menu.outlet_id === outletId);
  };

  const toggleOutlet = (outletId: string) => {
    setSelectedOutletIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(outletId)) {
        newSet.delete(outletId);
        // Retirer aussi le menu sélectionné pour cet outlet
        setSelectedMenuByOutlet(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(outletId);
          return newMap;
        });
      } else {
        newSet.add(outletId);
      }
      return newSet;
    });
  };

  const handleMenuSelect = (outletId: string, menuId: string) => {
    setSelectedMenuByOutlet(prev => {
      const newMap = new Map(prev);
      newMap.set(outletId, menuId);
      return newMap;
    });
  };

  const canConfirm = useMemo(() => {
    if (selectedOutletIds.size === 0) return false;
    // Vérifier que chaque outlet sélectionné a un menu choisi
    for (const outletId of Array.from(selectedOutletIds)) {
      if (!selectedMenuByOutlet.has(outletId)) return false;
    }
    return true;
  }, [selectedOutletIds, selectedMenuByOutlet]);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    
    setIsLoading(true);
    try {
      const menuIds = Array.from(selectedMenuByOutlet.values());
      await onConfirm(menuIds);
      setSelectedOutletIds(new Set());
      setSelectedMenuByOutlet(new Map());
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOutletIds(new Set());
    setSelectedMenuByOutlet(new Map());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager {isBulkTransfer ? 'les plats' : 'le plat'}</DialogTitle>
          <DialogDescription>
            {isBulkTransfer 
              ? "Sélectionnez les outlets et leurs menus de destination"
              : `Sélectionnez où copier "${itemName}"`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              1. Sélectionner les points de vente
            </Label>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {availableOutlets.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Aucun autre point de vente disponible
                </div>
              ) : (
                availableOutlets.map((outlet) => {
                  const outletMenus = getMenusForOutlet(outlet.id);
                  const isSelected = selectedOutletIds.has(outlet.id);
                  
                  return (
                    <div key={outlet.id} className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOutlet(outlet.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">{outlet.name}</span>
                      </label>
                      
                      {isSelected && (
                        <div className="ml-7 space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            2. Choisir le menu de destination
                          </Label>
                          {outletMenus.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                              Aucun menu disponible pour ce point de vente
                            </p>
                          ) : (
                            <Select
                              value={selectedMenuByOutlet.get(outlet.id) || ''}
                              onValueChange={(value) => handleMenuSelect(outlet.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner un menu" />
                              </SelectTrigger>
                              <SelectContent>
                                {outletMenus.map((menu) => (
                                  <SelectItem key={menu.id} value={menu.id}>
                                    {menu.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {selectedOutletIds.size > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedOutletIds.size} point{selectedOutletIds.size > 1 ? 's' : ''} de vente sélectionné{selectedOutletIds.size > 1 ? 's' : ''}
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
            disabled={!canConfirm || isLoading}
          >
            {isLoading ? 'Partage...' : 'Partager'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMenuItemModal;
