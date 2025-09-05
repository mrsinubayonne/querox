import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MenuCategory } from './useMenus';

export interface CategoryInput {
  name: string;
  description?: string;
  menu_id: string;
  order_index?: number;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  order_index?: number;
}

export const useMenuCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addCategory = useCallback(async (categoryData: CategoryInput): Promise<MenuCategory | null> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter une catégorie",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('📂 Adding category:', categoryData);

      // Vérifier que le menu appartient à l'utilisateur
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .select('id, user_id')
        .eq('id', categoryData.menu_id)
        .eq('user_id', user.id)
        .single();

      if (menuError || !menu) {
        console.error('Menu validation error:', menuError);
        toast({
          title: "Erreur",
          description: "Menu invalide ou non trouvé",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('menu_categories')
        .insert([{
          ...categoryData,
          order_index: categoryData.order_index ?? 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'ajouter la catégorie",
          variant: "destructive",
        });
        return null;
      }

      console.log('✅ Category added successfully:', data.id);
      toast({
        title: "Succès",
        description: "Catégorie ajoutée avec succès",
      });
      return data;

    } catch (error: any) {
      console.error('🚨 Error adding category:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateCategory = useCallback(async (id: string, updates: CategoryUpdate): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier une catégorie",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🔄 Updating category:', id, updates);

      // Vérifier que la catégorie appartient à l'utilisateur
      const { data: existingCategory, error: checkError } = await supabase
        .from('menu_categories')
        .select(`
          id,
          menus!inner(user_id)
        `)
        .eq('id', id)
        .eq('menus.user_id', user.id)
        .single();

      if (checkError || !existingCategory) {
        console.error('Category ownership check failed:', checkError);
        toast({
          title: "Erreur",
          description: "Catégorie non trouvée ou non autorisée",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from('menu_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de modifier la catégorie",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Category updated successfully:', data.id);
      toast({
        title: "Succès",
        description: "Catégorie modifiée avec succès",
      });
      return true;

    } catch (error: any) {
      console.error('🚨 Error updating category:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer une catégorie",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🗑️ Deleting category:', id);

      // Vérifier que la catégorie appartient à l'utilisateur
      const { data: existingCategory, error: checkError } = await supabase
        .from('menu_categories')
        .select(`
          id,
          menus!inner(user_id)
        `)
        .eq('id', id)
        .eq('menus.user_id', user.id)
        .single();

      if (checkError || !existingCategory) {
        console.error('Category ownership check failed:', checkError);
        toast({
          title: "Erreur",
          description: "Catégorie non trouvée ou non autorisée",
          variant: "destructive",
        });
        return false;
      }

      // Vérifier s'il y a des items dans cette catégorie
      const { data: itemsInCategory, error: itemsError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (itemsError) {
        console.error('Error checking items in category:', itemsError);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier les plats dans cette catégorie",
          variant: "destructive",
        });
        return false;
      }

      if (itemsInCategory && itemsInCategory.length > 0) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer une catégorie qui contient des plats",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de supprimer la catégorie",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Category deleted successfully');
      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès",
      });
      return true;

    } catch (error: any) {
      console.error('🚨 Error deleting category:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
  };
};