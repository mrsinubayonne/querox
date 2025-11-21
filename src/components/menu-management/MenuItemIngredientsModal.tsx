import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMenuItemIngredients } from '@/hooks/useMenuItemIngredients';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MenuItemIngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: string;
  menuItemName: string;
}

const MenuItemIngredientsModal: React.FC<MenuItemIngredientsModalProps> = ({
  isOpen,
  onClose,
  menuItemId,
  menuItemName
}) => {
  const { ingredients, loading, addIngredient, updateIngredient, removeIngredient } = useMenuItemIngredients(menuItemId);
  const { items: inventoryItems } = useInventory();
  
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');

  const handleAddIngredient = async () => {
    if (!selectedInventoryItem || !quantity || parseFloat(quantity) <= 0) {
      return;
    }

    const inventoryItem = inventoryItems.find(item => item.id === selectedInventoryItem);
    if (!inventoryItem) return;

    const success = await addIngredient(
      selectedInventoryItem,
      parseFloat(quantity),
      inventoryItem.unit
    );

    if (success) {
      setSelectedInventoryItem('');
      setQuantity('1');
    }
  };

  const availableInventoryItems = inventoryItems.filter(
    item => !ingredients.some(ing => ing.inventory_item_id === item.id)
  );

  const hasLowStock = ingredients.some(
    ing => ing.inventory_item && ing.inventory_item.current_stock < ing.quantity_needed * 5
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ingrédients - {menuItemName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {hasLowStock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Certains ingrédients sont en stock faible
              </AlertDescription>
            </Alert>
          )}

          {/* Liste des ingrédients existants */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Ingrédients actuels</h3>
            {ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun ingrédient configuré. Les stocks ne seront pas déduits automatiquement.
              </p>
            ) : (
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{ingredient.inventory_item?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ingredient.quantity_needed} {ingredient.unit} par plat
                      </p>
                      {ingredient.inventory_item && (
                        <p className={`text-xs ${
                          ingredient.inventory_item.current_stock < ingredient.quantity_needed * 5
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}>
                          Stock actuel: {ingredient.inventory_item.current_stock} {ingredient.unit}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={ingredient.quantity_needed}
                        onChange={(e) => updateIngredient(ingredient.id, parseFloat(e.target.value))}
                        className="w-20"
                        min="0.01"
                        step="0.01"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(ingredient.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ajouter un nouvel ingrédient */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm">Ajouter un ingrédient</h3>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div>
                <Label htmlFor="inventory-item">Article d'inventaire</Label>
                <Select value={selectedInventoryItem} onValueChange={setSelectedInventoryItem}>
                  <SelectTrigger id="inventory-item">
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.current_stock} {item.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-24"
                  min="0.01"
                  step="0.01"
                  placeholder="1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddIngredient}
                  disabled={!selectedInventoryItem || !quantity}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Déduction automatique:</strong> Quand une commande contenant ce plat est marquée comme "livrée" ou "terminée", 
                les ingrédients configurés seront automatiquement déduits de votre inventaire.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemIngredientsModal;
