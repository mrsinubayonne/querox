
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOutlets } from '@/hooks/useOutlets';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface CreateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMenuModal: React.FC<CreateMenuModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { selectedOutletId } = useOutlets();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un menu",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du menu est requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (!selectedOutletId) {
        toast({
          title: "Erreur",
          description: "Aucun point de vente sélectionné",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('🔥 Création du menu:', { name, description, isActive, outletId: selectedOutletId });

      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          user_id: user.id,
          outlet_id: selectedOutletId,
          is_active: isActive
        })
        .select()
        .single();

      if (menuError) {
        console.error('Erreur création menu:', menuError);
        throw menuError;
      }

      console.log('🔥 Menu créé avec succès:', menu.id);

      // Créer les catégories par défaut
      const defaultCategories = [
        { name: 'Entrées', order_index: 0 },
        { name: 'Plats principaux', order_index: 1 },
        { name: 'Desserts', order_index: 2 },
        { name: 'Boissons', order_index: 3 }
      ];

      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        menu_id: menu.id
      }));
      const { error: categoriesError } = await supabase
        .from('menu_categories')
        .insert(categoriesToInsert);

      if (categoriesError) {
        console.error('Erreur création catégories:', categoriesError);
        // Ne pas faire échouer la création du menu si les catégories échouent
      } else {
        console.log('🔥 Catégories par défaut créées');
      }

      toast({
        title: "Succès",
        description: "Menu créé avec succès",
      });

      // Reset form
      setName('');
      setDescription('');
      setIsActive(true);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('🔥 Erreur création menu:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le menu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setIsActive(true);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau menu</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="menu-name">Nom du menu *</Label>
            <Input
              id="menu-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Menu Principal, Menu du Soir..."
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-description">Description</Label>
            <Textarea
              id="menu-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle du menu..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="menu-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={loading}
            />
            <Label htmlFor="menu-active">Menu actif</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le menu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMenuModal;
