import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MenuItemIngredient {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity_needed: number;
  unit: string;
  created_at: string;
  updated_at: string;
  inventory_item?: {
    id: string;
    name: string;
    unit: string;
    current_stock: number;
  };
}

export const useMenuItemIngredients = (menuItemId?: string) => {
  const [ingredients, setIngredients] = useState<MenuItemIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchIngredients = useCallback(async () => {
    if (!menuItemId || !user) {
      setIngredients([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_item_ingredients')
        .select(`
          *,
          inventory_item:inventory_items(id, name, unit, current_stock)
        `)
        .eq('menu_item_id', menuItemId);

      if (error) throw error;
      setIngredients(data || []);
    } catch (error: any) {
      console.error('Error fetching ingredients:', error);
      toast.error("Erreur", { description: "Impossible de charger les ingrédients" });
    } finally {
      setLoading(false);
    }
  }, [menuItemId, user, toast]);

  const addIngredient = useCallback(async (inventoryItemId: string, quantityNeeded: number, unit: string) => {
    if (!menuItemId || !user) return false;

    try {
      const { error } = await supabase
        .from('menu_item_ingredients')
        .insert({
          menu_item_id: menuItemId,
          inventory_item_id: inventoryItemId,
          quantity_needed: quantityNeeded,
          unit
        });

      if (error) throw error;

      toast.success("Succès", { description: "Ingrédient ajouté au plat" });

      await fetchIngredients();
      return true;
    } catch (error: any) {
      console.error('Error adding ingredient:', error);
      toast.error("Erreur", { description: error.message || "Impossible d'ajouter l'ingrédient" });
      return false;
    }
  }, [menuItemId, user, toast, fetchIngredients]);

  const updateIngredient = useCallback(async (ingredientId: string, quantityNeeded: number) => {
    try {
      const { error } = await supabase
        .from('menu_item_ingredients')
        .update({ quantity_needed: quantityNeeded })
        .eq('id', ingredientId);

      if (error) throw error;

      toast.success("Succès", { description: "Quantité mise à jour" });

      await fetchIngredients();
      return true;
    } catch (error: any) {
      console.error('Error updating ingredient:', error);
      toast.error("Erreur", { description: "Impossible de mettre à jour l'ingrédient" });
      return false;
    }
  }, [toast, fetchIngredients]);

  const removeIngredient = useCallback(async (ingredientId: string) => {
    try {
      const { error } = await supabase
        .from('menu_item_ingredients')
        .delete()
        .eq('id', ingredientId);

      if (error) throw error;

      toast.success("Succès", { description: "Ingrédient retiré" });

      await fetchIngredients();
      return true;
    } catch (error: any) {
      console.error('Error removing ingredient:', error);
      toast.error("Erreur", { description: "Impossible de retirer l'ingrédient" });
      return false;
    }
  }, [toast, fetchIngredients]);

  useEffect(() => {
    if (menuItemId) {
      fetchIngredients();
    }
  }, [fetchIngredients, menuItemId]);

  return {
    ingredients,
    loading,
    addIngredient,
    updateIngredient,
    removeIngredient,
    refetch: fetchIngredients
  };
};
