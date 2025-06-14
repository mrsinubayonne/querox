
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MenuItemInput {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available?: boolean;
  allergens?: string[];
}

export const useMenuItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addMenuItem = async (itemData: MenuItemInput) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        console.error('Error adding menu item:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le plat",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Succès",
          description: "Plat ajouté avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItemInput>) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating menu item:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le plat",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Succès",
          description: "Plat modifié avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting menu item:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le plat",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Succès",
          description: "Plat supprimé avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    return await updateMenuItem(id, { is_available: isAvailable });
  };

  return {
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    loading,
  };
};
