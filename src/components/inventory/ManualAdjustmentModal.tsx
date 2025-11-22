import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory } from '@/hooks/useInventory';
import { useStockMovements } from '@/hooks/useStockMovements';
import { Package } from "lucide-react";

interface ManualAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  currentStock: number;
  unit: string;
}

const ManualAdjustmentModal: React.FC<ManualAdjustmentModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  currentStock,
  unit
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reasonCategory, setReasonCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateItem } = useInventory();
  const { createMovement } = useStockMovements();

  const handleSubmit = async () => {
    if (!quantity || !reasonCategory) return;

    setIsSubmitting(true);

    const quantityNum = parseFloat(quantity);
    const adjustedQuantity = adjustmentType === 'add' ? quantityNum : -quantityNum;
    const newStock = currentStock + adjustedQuantity;

    // Mettre à jour le stock
    const updated = await updateItem(itemId, {
      current_stock: newStock
    });

    if (updated) {
      // Créer le mouvement
      await createMovement({
        item_id: itemId,
        quantity: adjustedQuantity,
        movement_type: 'ajustement',
        reason: `Ajustement manuel - ${reasonCategory}`,
        before_quantity: currentStock,
        after_quantity: newStock,
        reason_category: reasonCategory,
        notes: notes || undefined
      });

      onClose();
      setQuantity('');
      setReasonCategory('');
      setNotes('');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ajustement manuel - {itemName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Stock actuel</p>
            <p className="text-2xl font-bold">{currentStock} {unit}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={adjustmentType === 'add' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('add')}
              className="w-full"
            >
              + Ajouter
            </Button>
            <Button
              variant={adjustmentType === 'remove' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('remove')}
              className="w-full"
            >
              - Retirer
            </Button>
          </div>

          <div>
            <Label>Quantité *</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Entrez la quantité"
            />
          </div>

          <div>
            <Label>Raison de l'ajustement *</Label>
            <Select value={reasonCategory} onValueChange={setReasonCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventaire_physique">Inventaire physique</SelectItem>
                <SelectItem value="erreur_saisie">Erreur de saisie</SelectItem>
                <SelectItem value="perte">Perte / Casse</SelectItem>
                <SelectItem value="peremption">Péremption</SelectItem>
                <SelectItem value="vol">Vol</SelectItem>
                <SelectItem value="retour_fournisseur">Retour fournisseur</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes (optionnel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>

          {quantity && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium">Nouveau stock prévu</p>
              <p className="text-2xl font-bold text-primary">
                {currentStock + (adjustmentType === 'add' ? parseFloat(quantity) : -parseFloat(quantity))} {unit}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!quantity || !reasonCategory || isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Valider l\'ajustement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualAdjustmentModal;
