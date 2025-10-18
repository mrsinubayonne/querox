
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    unit: '',
    price: 0,
    supplier: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(formData);
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      minQuantity: 0,
      unit: '',
      price: 0,
      supplier: ''
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom de l'article</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ex: Riz Jasmin"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Céréales">Céréales</SelectItem>
                  <SelectItem value="Huiles">Huiles</SelectItem>
                  <SelectItem value="Légumes">Légumes</SelectItem>
                  <SelectItem value="Protéines">Protéines</SelectItem>
                  <SelectItem value="Épices">Épices</SelectItem>
                  <SelectItem value="Boissons">Boissons</SelectItem>
                  <SelectItem value="Autres">Autres</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', Number(e.target.value))}
                min="0"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="minQuantity">Seuil minimum</Label>
              <Input
                id="minQuantity"
                type="number"
                value={formData.minQuantity}
                onChange={(e) => handleChange('minQuantity', Number(e.target.value))}
                min="0"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="unit">Unité</Label>
              <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="mL">mL</SelectItem>
                  <SelectItem value="pièces">pièces</SelectItem>
                  <SelectItem value="sacs">sacs</SelectItem>
                  <SelectItem value="bidons">bidons</SelectItem>
                  <SelectItem value="cartons">cartons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix unitaire (CFA)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                min="0"
                placeholder="0"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="supplier">Fournisseur (optionnel)</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                placeholder="ex: Marché Central"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Ajouter l'article
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryModal;
