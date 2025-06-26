
import { useState, useCallback } from 'react';
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

export const useOptimizedMenuItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const ensureDefaultMenu = useCallback(async () => {
    if (!user) return null;

    const { data: existingMenus, error: menusError } = await supabase
      .from('menus')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (menusError) {
      console.error('Error checking existing menus:', menusError);
      return null;
    }

    if (existingMenus && existingMenus.length > 0) {
      return existingMenus[0].id;
    }

    const { data: newMenu, error: createMenuError } = await supabase
      .from('menus')
      .insert([{
        name: 'Menu Principal',
        description: 'Menu principal du restaurant',
        user_id: user.id
      }])
      .select('id')
      .single();

    if (createMenuError) {
      console.error('Error creating default menu:', createMenuError);
      return null;
    }

    return newMenu.id;
  }, [user]);

  const createPredefinedCategory = useCallback(async (categoryName: string, menuId: string) => {
    const { data: newCategory, error } = await supabase
      .from('menu_categories')
      .insert([{
        name: categoryName,
        menu_id: menuId,
        order_index: 0
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating predefined category:', error);
      return null;
    }

    return newCategory.id;
  }, []);

  const addMenuItem = useCallback(async (itemData: MenuItemInput) => {
    if (!user) return false;

    setLoading(true);
    try {
      console.log('Adding menu item with data:', itemData);

      const menuId = await ensureDefaultMenu();
      if (!menuId) {
        toast({
          title: "Erreur",
          description: "Impossible de créer ou accéder au menu",
          variant: "destructive",
        });
        return false;
      }

      let categoryId = itemData.category_id;

      if (categoryId.startsWith('predefined-')) {
        const categoryName = categoryId.replace('predefined-', '');
        console.log('Creating predefined category:', categoryName);

        const { data: existingCategory } = await supabase
          .from('menu_categories')
          .select('id')
          .eq('name', categoryName)
          .eq('menu_id', menuId)
          .single();

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const newCategoryId = await createPredefinedCategory(categoryName, menuId);
          if (!newCategoryId) {
            toast({
              title: "Erreur",
              description: "Impossible de créer la catégorie",
              variant: "destructive",
            });
            return false;
          }
          categoryId = newCategoryId;
        }
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          ...itemData,
          category_id: categoryId
        }])
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
        console.log('Menu item added successfully:', data);
        toast({
          title: "Succès",
          description: "Plat ajouté avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, ensureDefaultMenu, createPredefinedCategory, toast]);

  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItemInput>) => {
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
  }, [user, toast]);

  const deleteMenuItem = useCallback(async (id: string) => {
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
  }, [user, toast]);

  const toggleAvailability = useCallback(async (id: string, isAvailable: boolean) => {
    return await updateMenuItem(id, { is_available: isAvailable });
  }, [updateMenuItem]);

  return {
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    loading,
  };
};
