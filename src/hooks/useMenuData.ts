
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/types/menu';

export const useMenuData = (menuId: string | null) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantUserId, setRestaurantUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMenu = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setRestaurantUserId(null);
    
    try {
      if (!id || id.length < 10) {
        throw new Error("L'identifiant du menu n'est pas valide.");
      }

      const { data: menusData, error: menuError } = await supabase
        .from('menus')
        .select('id, name, user_id, is_active')
        .eq('id', id);

      if (menuError) {
        console.error("Error fetching menu:", menuError);
        throw new Error(`Erreur de base de données: ${menuError.message}`);
      }

      if (!menusData || menusData.length === 0) {
        throw new Error("Ce menu n'existe pas. Veuillez vérifier l'ID du menu.");
      }
      
      const menuData = menusData[0];
      if (menusData.length > 1) {
          console.warn(`Multiple menus found for ID ${id}. Using the first one.`);
      }
      
      if (!menuData.is_active) {
        throw new Error("Ce menu n'est pas disponible actuellement.");
      }

      setRestaurantUserId(menuData.user_id);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', id);

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw new Error(`Erreur lors du chargement des catégories: ${categoriesError.message}`);
      }

      if (!categoriesData || categoriesData.length === 0) {
        throw new Error("Ce menu ne contient aucune catégorie. Veuillez contacter le restaurant.");
      }
      
      const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]));
      const categoryIds = categoriesData.map((c: any) => c.id);
      
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_available', true)
        .order('name');

      if (itemsError) {
        console.error("Error fetching menu items:", itemsError);
        throw new Error(`Erreur lors du chargement des plats: ${itemsError.message}`);
      }

      if (!menuItemsData || menuItemsData.length === 0) {
        setMenuItems([]);
        return;
      }

      const transformedItems: MenuItem[] = menuItemsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        image_url: item.image_url || undefined,
        category_name: categoryMap.get(item.category_id) || 'Autres',
        is_available: item.is_available,
      }));

      setMenuItems(transformedItems);
    } catch (err: any) {
      console.error('Error loading menu:', err);
      const errorMessage = err.message || "Impossible de charger le menu.";
      setError(errorMessage);
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (menuId) {
      fetchMenu(menuId);
    } else {
      setLoading(false);
      setError("Aucun identifiant de menu fourni dans l'URL.");
    }
  }, [menuId, fetchMenu]);

  return { menuItems, loading, error, restaurantUserId };
};
