import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MenuItemInput {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available?: boolean;
  allergens?: string[];
  order_index?: number;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  image_url?: string;
  is_available?: boolean;
  allergens?: string[];
  order_index?: number;
}

export const useMenuItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addMenuItem = useCallback(async (itemData: MenuItemInput): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un plat",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🍽️ Adding menu item:', itemData);

      // Vérifier que la catégorie existe et appartient à l'utilisateur
      const { data: category, error: categoryError } = await supabase
        .from('menu_categories')
        .select(`
          id,
          menus!inner(user_id)
        `)
        .eq('id', itemData.category_id)
        .eq('menus.user_id', user.id)
        .single();

      if (categoryError || !category) {
        console.error('Category validation error:', categoryError);
        toast({
          title: "Erreur",
          description: "Catégorie invalide ou non trouvée",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          ...itemData,
          is_available: itemData.is_available ?? true,
          order_index: itemData.order_index ?? 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding menu item:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'ajouter le plat",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Menu item added successfully:', data.id);
      toast({
        title: "Succès",
        description: "Plat ajouté avec succès",
      });
      return true;

    } catch (error: any) {
      console.error('🚨 Error adding menu item:', error);
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

  const updateMenuItem = useCallback(async (id: string, updates: MenuItemUpdate): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier un plat",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🔄 Updating menu item:', id, updates);

      // Vérifier que l'item appartient à l'utilisateur
      const { data: existingItem, error: checkError } = await supabase
        .from('menu_items')
        .select(`
          id,
          menu_categories!inner(
            menus!inner(user_id)
          )
        `)
        .eq('id', id)
        .eq('menu_categories.menus.user_id', user.id)
        .single();

      if (checkError || !existingItem) {
        console.error('Item ownership check failed:', checkError);
        toast({
          title: "Erreur",
          description: "Plat non trouvé ou non autorisé",
          variant: "destructive",
        });
        return false;
      }

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
          description: error.message || "Impossible de modifier le plat",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Menu item updated successfully:', data.id);
      toast({
        title: "Succès",
        description: "Plat modifié avec succès",
      });
      return true;

    } catch (error: any) {
      console.error('🚨 Error updating menu item:', error);
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

  const deleteMenuItem = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer un plat",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🗑️ Deleting menu item:', id);

      // Vérifier que l'item appartient à l'utilisateur
      const { data: existingItem, error: checkError } = await supabase
        .from('menu_items')
        .select(`
          id,
          menu_categories!inner(
            menus!inner(user_id)
          )
        `)
        .eq('id', id)
        .eq('menu_categories.menus.user_id', user.id)
        .single();

      if (checkError || !existingItem) {
        console.error('Item ownership check failed:', checkError);
        toast({
          title: "Erreur",
          description: "Plat non trouvé ou non autorisé",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting menu item:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de supprimer le plat",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Menu item deleted successfully');
      toast({
        title: "Succès",
        description: "Plat supprimé avec succès",
      });
      return true;

    } catch (error: any) {
      console.error('🚨 Error deleting menu item:', error);
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

  const toggleAvailability = useCallback(async (id: string, isAvailable: boolean): Promise<boolean> => {
    return await updateMenuItem(id, { is_available: isAvailable });
  }, [updateMenuItem]);

  const shareMenuItems = useCallback(async (itemIds: string[], targetOutletIds: string[]): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour partager des plats",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('🔄 Sharing menu items:', itemIds, 'to outlets:', targetOutletIds);

      // Récupérer les données complètes des items à partager avec leurs catégories et menus
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories!inner(
            id,
            name,
            menus!inner(
              id,
              name,
              outlet_id,
              user_id
            )
          )
        `)
        .in('id', itemIds)
        .eq('menu_categories.menus.user_id', user.id);

      if (itemsError || !items || items.length === 0) {
        console.error('Items fetch error:', itemsError);
        toast({
          title: "Erreur",
          description: "Plats non trouvés ou non autorisés",
          variant: "destructive",
        });
        return false;
      }

      // Récupérer tous les menus et catégories des outlets de destination
      const { data: targetMenus, error: menusError } = await supabase
        .from('menus')
        .select(`
          id,
          name,
          outlet_id,
          menu_categories(id, name)
        `)
        .in('outlet_id', targetOutletIds)
        .eq('user_id', user.id);

      if (menusError || !targetMenus) {
        console.error('Target menus fetch error:', menusError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les menus de destination",
          variant: "destructive",
        });
        return false;
      }

      // Créer les nouveaux items (copie vers chaque outlet)
      const itemsToInsert = [];
      for (const item of items) {
        const sourceCategory = item.menu_categories;
        const sourceMenu = sourceCategory.menus;
        
        // Pour chaque outlet de destination
        for (const outletId of targetOutletIds) {
          // Trouver le menu avec le même nom dans cet outlet
          const targetMenu = targetMenus.find(
            m => m.outlet_id === outletId && m.name === sourceMenu.name
          );

          if (targetMenu && targetMenu.menu_categories) {
            // Trouver la catégorie avec le même nom dans ce menu
            const targetCategory = targetMenu.menu_categories.find(
              c => c.name === sourceCategory.name
            );

            if (targetCategory && targetCategory.id !== item.category_id) {
              itemsToInsert.push({
                name: item.name,
                description: item.description,
                price: item.price,
                category_id: targetCategory.id,
                image_url: item.image_url,
                is_available: item.is_available,
                allergens: item.allergens,
                order_index: item.order_index || 0,
              });
            }
          }
        }
      }

      if (itemsToInsert.length === 0) {
        toast({
          title: "Information",
          description: "Aucune catégorie correspondante trouvée dans les points de vente sélectionnés",
        });
        return true;
      }

      const { error: insertError } = await supabase
        .from('menu_items')
        .insert(itemsToInsert);

      if (insertError) {
        console.error('Error sharing menu items:', insertError);
        toast({
          title: "Erreur",
          description: "Impossible de partager les plats",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Menu items shared successfully');
      toast({
        title: "Succès",
        description: `${itemsToInsert.length} plat(s) partagé(s) avec succès`,
      });
      return true;

    } catch (error: any) {
      console.error('🚨 Error sharing menu items:', error);
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
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    shareMenuItems,
    loading,
  };
};