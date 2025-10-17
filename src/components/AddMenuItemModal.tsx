
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useMenus } from '@/hooks/useMenus';
import ImageUpload from '@/components/ImageUpload';
import { PREDEFINED_CATEGORIES } from '@/data/menuCategories';
import { APP_CONFIG } from '@/config/app.config';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { addMenuItem, loading } = useMenuItems();
  const { categories } = useMenus();
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    category_id: string;
    image_url: string;
    is_available: boolean;
    allergens: string[];
  }>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    image_url: APP_CONFIG.images.defaultMenuItem,
    is_available: true,
    allergens: []
  });

  const [allergenInput, setAllergenInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || formData.price <= 0) {
      return;
    }

    const success = await addMenuItem({
      ...formData,
      allergens: formData.allergens.length > 0 ? formData.allergens : undefined
    });

    if (success) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        image_url: APP_CONFIG.images.defaultMenuItem,
        is_available: true,
        allergens: []
      });
      setAllergenInput('');
      onSuccess();
      onClose();
    }
  };

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergenInput.trim()]
      }));
      setAllergenInput('');
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau plat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du plat *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 && (
                  <>
                    <SelectItem value="header-existing" disabled className="font-semibold text-gray-500">
                      Vos catégories existantes
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                <SelectItem value="header-suggested" disabled className="font-semibold text-gray-500 border-t pt-2 mt-2">
                  Catégories suggérées
                </SelectItem>
                {PREDEFINED_CATEGORIES
                  .filter(predefined => !categories.some(cat => cat.name.toLowerCase() === predefined.toLowerCase()))
                  .map((categoryName) => (
                    <SelectItem key={`predefined-${categoryName}`} value={`predefined-${categoryName}`}>
                      {categoryName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <ImageUpload
            currentImage={formData.image_url}
            onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, image_url: imageUrl }))}
          />

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label>Allergènes</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                placeholder="Ajouter un allergène"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
              />
              <Button type="button" onClick={addAllergen} variant="outline">
                Ajouter
              </Button>
            </div>
            {formData.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
            />
            <Label htmlFor="available">Plat disponible</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Ajout...' : 'Ajouter le plat'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMenuItemModal;
