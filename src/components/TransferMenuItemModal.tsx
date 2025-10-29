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

interface Outlet {
  id: string;
  name: string;
}

interface TransferMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (outletIds: string[]) => Promise<void>;
  itemName: string;
  outlets: Outlet[];
  currentOutletId: string;
  isBulkTransfer?: boolean;
}

const TransferMenuItemModal: React.FC<TransferMenuItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  outlets,
  currentOutletId,
  isBulkTransfer = false,
}) => {
  const [selectedOutletIds, setSelectedOutletIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const availableOutlets = useMemo(() => {
    return outlets.filter(outlet => outlet.id !== currentOutletId);
  }, [outlets, currentOutletId]);

  const toggleOutlet = (outletId: string) => {
    setSelectedOutletIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(outletId)) {
        newSet.delete(outletId);
      } else {
        newSet.add(outletId);
      }
      return newSet;
    });
  };

  const handleConfirm = async () => {
    if (selectedOutletIds.size === 0) return;
    
    setIsLoading(true);
    try {
      await onConfirm(Array.from(selectedOutletIds));
      setSelectedOutletIds(new Set());
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOutletIds(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager {isBulkTransfer ? 'les plats' : 'le plat'}</DialogTitle>
          <DialogDescription>
            {isBulkTransfer 
              ? "Copier les plats sélectionnés dans les mêmes catégories des autres points de vente"
              : `Copier "${itemName}" dans la même catégorie des autres points de vente`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Sélectionner les points de vente
            </Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableOutlets.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Aucun autre point de vente disponible
                </div>
              ) : (
                availableOutlets.map((outlet) => (
                  <label
                    key={outlet.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOutletIds.has(outlet.id)}
                      onChange={() => toggleOutlet(outlet.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">{outlet.name}</span>
                  </label>
                ))
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
            disabled={selectedOutletIds.size === 0 || isLoading}
          >
            {isLoading ? 'Partage...' : 'Partager'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMenuItemModal;
