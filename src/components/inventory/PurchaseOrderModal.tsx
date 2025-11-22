import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  inventory_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose }) => {
  const { createOrder } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { items } = useInventory();

  const [supplierId, setSupplierId] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    if (!selectedItemId || !itemQuantity) return;

    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    const quantity = parseFloat(itemQuantity);
    const unitPrice = item.unit_price || 0;
    const total = quantity * unitPrice;

    setOrderItems([...orderItems, {
      inventory_item_id: item.id,
      item_name: item.name,
      quantity,
      unit_price: unitPrice,
      total
    }]);

    setSelectedItemId('');
    setItemQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async () => {
    if (!supplierId || orderItems.length === 0) return;

    setIsSubmitting(true);

    await createOrder({
      supplier_id: supplierId,
      outlet_id: null,
      status: 'draft',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: expectedDeliveryDate || null,
      actual_delivery_date: null,
      items: orderItems,
      total_amount: calculateTotal(),
      notes: notes || null
    });

    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setSupplierId('');
    setExpectedDeliveryDate('');
    setNotes('');
    setOrderItems([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nouvelle commande fournisseur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fournisseur *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date de livraison prévue</Label>
              <Input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Ajout d'articles */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-medium">Ajouter des articles</h3>
            <div className="grid grid-cols-3 gap-3">
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Article" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.unit_price ? `${item.unit_price} CFA` : 'Prix non défini'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Quantité"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
              />

              <Button 
                onClick={handleAddItem}
                disabled={!selectedItemId || !itemQuantity}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Liste des articles */}
          {orderItems.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-3 bg-muted border-b">
                <h3 className="font-medium">Articles commandés ({orderItems.length})</h3>
              </div>
              <div className="divide-y">
                {orderItems.map((item, index) => (
                  <div key={index} className="p-3 flex items-center justify-between hover:bg-accent/50">
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {item.unit_price.toLocaleString()} CFA = {item.total.toLocaleString()} CFA
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-muted border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">
                    {calculateTotal().toLocaleString()} CFA
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Notes (optionnel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations supplémentaires..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!supplierId || orderItems.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Création...' : 'Créer la commande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderModal;
