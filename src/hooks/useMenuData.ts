
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
      console.log(`🔥 Début récupération menu public pour menu_id: ${id}`);

      // D'abord récupérer l'user_id du restaurant
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (menuError) {
        console.error("🔥 Erreur lors de la récupération de l'user_id:", menuError);
        throw menuError;
      }

      if (!menuData || !menuData.user_id) {
        console.error("🔥 Aucun user_id trouvé pour ce menu");
        throw new Error("Menu non trouvé ou mal configuré");
      }

      console.log("🔥 User_id récupéré:", menuData.user_id);
      setRestaurantUserId(menuData.user_id);

      // Ensuite récupérer les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', id);

      if (categoriesError) throw categoriesError;

      if (!categoriesData || categoriesData.length === 0) {
        console.warn("🔥 Aucune catégorie trouvée pour ce menu.");
        setMenuItems([]);
        return;
      }
      
      const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]));
      const categoryIds = categoriesData.map((c: any) => c.id);
      
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_available', true)
        .order('name');

      if (itemsError) throw itemsError;

      if (!menuItemsData || menuItemsData.length === 0) {
        console.warn("🔥 Aucun plat disponible trouvé pour ce menu");
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

      console.log("🔥 Plats transformés :", transformedItems);
      setMenuItems(transformedItems);
    } catch (err: any) {
      console.error('🔥 Erreur complète:', err);
      setError("Impossible de charger le menu. " + err.message);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le menu.",
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
    }
  }, [menuId, fetchMenu]);

  console.log("🔥 useMenuData retourne restaurantUserId:", restaurantUserId);

  return { menuItems, loading, error, restaurantUserId };
};
