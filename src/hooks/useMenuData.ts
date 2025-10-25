
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/types/menu';

interface MenuData {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  header_image_url?: string;
  outlet_id?: string;
}

export const useMenuData = (menuId: string | null) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantUserId, setRestaurantUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMenu = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Récupérer le menu et vérifier qu'il existe
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('user_id, outlet_id, name, description, logo_url, header_image_url, is_active')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (menuError || !menuData) {
        throw new Error("Menu non trouvé ou inactif");
      }

      setRestaurantUserId(menuData.user_id);
      setMenuData({
        id,
        name: menuData.name,
        description: menuData.description || undefined,
        logo_url: menuData.logo_url || undefined,
        header_image_url: menuData.header_image_url || undefined,
        outlet_id: menuData.outlet_id || undefined,
      });

      // 2. Récupérer les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', id)
        .order('order_index', { ascending: true });

      if (categoriesError) {
        throw new Error("Erreur lors de la récupération des catégories");
      }

      if (!categoriesData || categoriesData.length === 0) {
        setMenuItems([]);
        return;
      }
      const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]));
      const categoryIds = categoriesData.map((c: any) => c.id);
      
      // 3. Récupérer les plats
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_available', true)
        .order('order_index', { ascending: true });

      if (itemsError) {
        throw new Error("Erreur lors de la récupération des plats");
      }

      if (!menuItemsData || menuItemsData.length === 0) {
        setMenuItems([]);
        return;
      }

      // 4. Transformer les données
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
      const errorMessage = err.message || "Erreur lors du chargement du menu";
      setError(errorMessage);
      setMenuItems([]);
      setMenuData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (menuId) {
      fetchMenu(menuId);
    } else {
      setLoading(false);
      if (menuId === null) {
        setError("Aucun identifiant de menu fourni");
      }
    }
  }, [menuId, fetchMenu]);

  return { menuItems, loading, error, restaurantUserId, menuData };
};
