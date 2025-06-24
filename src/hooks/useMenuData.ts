
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

      // Vérifier d'abord si le menu existe
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('user_id, name')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (menuError) {
        console.error("Error fetching menu:", menuError);
        throw new Error("Erreur lors de la récupération du menu");
      }

      if (!menuData) {
        console.warn("🔥 Menu non trouvé ou inactif");
        setError("Menu non trouvé ou indisponible");
        setMenuItems([]);
        return;
      }

      setRestaurantUserId(menuData.user_id);
      console.log("🔥 Menu trouvé:", menuData.name);

      // Récupérer les catégories du menu
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', id)
        .order('order_index', { ascending: true });

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw new Error("Erreur lors de la récupération des catégories");
      }

      if (!categoriesData || categoriesData.length === 0) {
        console.warn("🔥 Aucune catégorie trouvée pour ce menu.");
        setMenuItems([]);
        return;
      }
      
      console.log("🔥 Catégories trouvées:", categoriesData.length);
      const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]));
      const categoryIds = categoriesData.map((c: any) => c.id);
      
      // Récupérer les plats disponibles
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_available', true)
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

      if (itemsError) {
        console.error("Error fetching menu items:", itemsError);
        throw new Error("Erreur lors de la récupération des plats");
      }

      if (!menuItemsData || menuItemsData.length === 0) {
        console.warn("🔥 Aucun plat disponible trouvé pour ce menu");
        setMenuItems([]);
        return;
      }

      // Transformer les données pour l'interface
      const transformedItems: MenuItem[] = menuItemsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        image_url: item.image_url || undefined,
        category_name: categoryMap.get(item.category_id) || 'Autres',
        is_available: item.is_available,
      }));

      console.log("🔥 Plats transformés avec succès:", transformedItems.length, "plats");
      setMenuItems(transformedItems);
      
    } catch (err: any) {
      console.error('🔥 Erreur complète:', err);
      const errorMessage = err.message || "Impossible de charger le menu";
      setError(errorMessage);
      setMenuItems([]);
      
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
      setError("Aucun identifiant de menu fourni");
    }
  }, [menuId, fetchMenu]);

  return { menuItems, loading, error, restaurantUserId };
};
