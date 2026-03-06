import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface DebtorInvoiceItemsManagerProps {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}

const DebtorInvoiceItemsManager: React.FC<DebtorInvoiceItemsManagerProps> = ({
  items,
  onChange,
}) => {
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice, setItemPrice] = useState("");

  const addItem = () => {
    if (!itemName || !itemPrice) return;

    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: itemName,
      quantity: parseInt(itemQuantity) || 1,
      price: parseFloat(itemPrice),
    };

    onChange([...items, newItem]);
    setItemName("");
    setItemQuantity("1");
    setItemPrice("");
  };

  const removeItem = (itemId: string) => {
    onChange(items.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    onChange(items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Articles de la facture</Label>
        
        {/* Liste des articles */}
        {items.length > 0 && (
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.price.toLocaleString()} XAF × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-16"
                    />
                    <div className="font-semibold min-w-[100px] text-right">
                      {(item.quantity * item.price).toLocaleString()} XAF
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="flex justify-end p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">
                Total: {totalAmount.toLocaleString()} XAF
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
          <div className="col-span-5">
            <Input
              placeholder="Nom de l'article"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              min="1"
              placeholder="Qté"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />
          </div>
          <div className="col-span-4">
            <Input
              type="number"
              step="0.01"
              placeholder="Prix unitaire"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              onClick={addItem}
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtorInvoiceItemsManager;
