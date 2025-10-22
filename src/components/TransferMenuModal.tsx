import React, { useState } from 'react';
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
import { Outlet } from '@/hooks/useOutlets';

interface TransferMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (outletId: string) => Promise<void>;
  menuName: string;
  outlets: Outlet[];
  currentOutletId: string | null;
}

const TransferMenuModal: React.FC<TransferMenuModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  menuName,
  outlets,
  currentOutletId,
}) => {
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const availableOutlets = outlets.filter(o => o.id !== currentOutletId);

  const handleConfirm = async () => {
    if (!selectedOutletId) return;
    
    setIsLoading(true);
    try {
      await onConfirm(selectedOutletId);
      onClose();
      setSelectedOutletId('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transférer le menu</DialogTitle>
          <DialogDescription>
            Transférer le menu "{menuName}" vers un autre point de vente
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">
            Point de vente de destination
          </label>
          <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un point de vente" />
            </SelectTrigger>
            <SelectContent>
              {availableOutlets.map((outlet) => (
                <SelectItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedOutletId || isLoading}
          >
            {isLoading ? 'Transfert...' : 'Transférer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMenuModal;
