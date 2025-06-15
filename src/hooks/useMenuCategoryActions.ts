
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MenuCategoryInput {
  name: string;
  description?: string;
  menu_id: string;
}

export const useMenuCategoryActions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addCategory = async (categoryData: MenuCategoryInput) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert([{ ...categoryData }])
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Succès", description: "Catégorie ajoutée." });
      return data;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<MenuCategoryInput>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast({ title: "Succès", description: "Catégorie mise à jour." });
      return data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Succès", description: "Catégorie supprimée." });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addCategory, updateCategory, deleteCategory, loading };
};
