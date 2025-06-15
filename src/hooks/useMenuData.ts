
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

      // Vérifier d'abord si l'ID est valide
      if (!id || id.length < 10) {
        console.error("🔥 ID de menu invalide:", id);
        throw new Error("L'identifiant du menu n'est pas valide.");
      }

      // D'abord récupérer l'user_id du restaurant
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('user_id, name, is_active')
        .eq('id', id)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter l'erreur PGRST116
      
      if (menuError) {
        console.error("🔥 Erreur lors de la récupération du menu:", menuError);
        throw new Error(`Erreur de base de données: ${menuError.message}`);
      }

      if (!menuData) {
        console.error("🔥 Aucun menu trouvé avec l'ID:", id);
        throw new Error("Ce menu n'existe pas ou a été supprimé.");
      }

      if (!menuData.user_id) {
        console.error("🔥 Aucun user_id trouvé pour ce menu");
        throw new Error("Menu non trouvé ou mal configuré");
      }

      if (!menuData.is_active) {
        console.error("🔥 Menu inactif");
        throw new Error("Ce menu n'est pas disponible actuellement.");
      }

      console.log("🔥 Menu trouvé:", menuData.name, "User_id récupéré:", menuData.user_id);
      setRestaurantUserId(menuData.user_id);

      // Ensuite récupérer les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', id);

      if (categoriesError) {
        console.error("🔥 Erreur lors de la récupération des catégories:", categoriesError);
        throw new Error(`Erreur lors du chargement des catégories: ${categoriesError.message}`);
      }

      if (!categoriesData || categoriesData.length === 0) {
        console.warn("🔥 Aucune catégorie trouvée pour ce menu.");
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
        console.error("🔥 Erreur lors de la récupération des plats:", itemsError);
        throw new Error(`Erreur lors du chargement des plats: ${itemsError.message}`);
      }

      if (!menuItemsData || menuItemsData.length === 0) {
        console.warn("🔥 Aucun plat disponible trouvé pour ce menu");
        throw new Error("Ce menu ne contient aucun plat disponible actuellement.");
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
      console.log("🔥 useMenuData: menuId fourni:", menuId);
      fetchMenu(menuId);
    } else {
      console.warn("🔥 useMenuData: Aucun menuId fourni");
      setLoading(false);
      setError("Aucun identifiant de menu fourni dans l'URL.");
    }
  }, [menuId, fetchMenu]);

  console.log("🔥 useMenuData retourne restaurantUserId:", restaurantUserId);

  return { menuItems, loading, error, restaurantUserId };
};
