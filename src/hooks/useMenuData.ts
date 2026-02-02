import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/types/menu';
import { getData, storeData } from '@/lib/offlineStorage';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface MenuData {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  header_image_url?: string;
  outlet_id?: string;
}

interface CachedMenuData {
  menuItems: MenuItem[];
  menuData: MenuData | null;
  userId: string | null;
  outletId: string | null;
}

export const useMenuData = (menuId: string | null) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantUserId, setRestaurantUserId] = useState<string | null>(null);
  const [outletId, setOutletId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isOffline } = useNetworkStatus();

  // Load from cache first
  const loadFromCache = useCallback(async (id: string): Promise<CachedMenuData | null> => {
    try {
      const cached = await getData<CachedMenuData>('menu_items', id);
      if (cached?.data) {
        return cached.data;
      }
    } catch (e) {
      console.warn('Failed to load menu from cache:', e);
    }
    return null;
  }, []);

  // Save to cache
  const saveToCache = useCallback(async (id: string, data: CachedMenuData) => {
    try {
      await storeData('menu_items', data, id);
    } catch (e) {
      console.warn('Failed to save menu to cache:', e);
    }
  }, []);

  const fetchMenu = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    // If offline, try to load from cache first
    if (isOffline) {
      const cached = await loadFromCache(id);
      if (cached) {
        setMenuItems(cached.menuItems);
        setMenuData(cached.menuData);
        setRestaurantUserId(cached.userId);
        setOutletId(cached.outletId);
        setLoading(false);
        return;
      }
      // If no cache, show error
      setError("Mode hors ligne - Aucune donnée en cache");
      setLoading(false);
      return;
    }
    
    try {
      // 1. Récupérer le menu et vérifier qu'il existe
      const { data: menuDataResult, error: menuError } = await supabase
        .from('menus')
        .select('user_id, outlet_id, name, description, logo_url, header_image_url, is_active')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (menuError) {
        console.error("Menu fetch error:", menuError);
        throw new Error("Erreur lors de la récupération du menu");
      }
      
      if (!menuDataResult) {
        throw new Error("Menu non trouvé ou inactif");
      }

      setRestaurantUserId(menuDataResult.user_id);
      setOutletId(menuDataResult.outlet_id || null);
      const newMenuData = {
        id,
        name: menuDataResult.name,
        description: menuDataResult.description || undefined,
        logo_url: menuDataResult.logo_url || undefined,
        header_image_url: menuDataResult.header_image_url || undefined,
        outlet_id: menuDataResult.outlet_id || undefined,
      };
      setMenuData(newMenuData);

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
        // Cache empty result
        await saveToCache(id, { 
          menuItems: [], 
          menuData: newMenuData, 
          userId: menuDataResult.user_id, 
          outletId: menuDataResult.outlet_id 
        });
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
        await saveToCache(id, { 
          menuItems: [], 
          menuData: newMenuData, 
          userId: menuDataResult.user_id, 
          outletId: menuDataResult.outlet_id 
        });
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

      // Cache the result
      await saveToCache(id, { 
        menuItems: transformedItems, 
        menuData: newMenuData, 
        userId: menuDataResult.user_id, 
        outletId: menuDataResult.outlet_id 
      });
      
    } catch (err: any) {
      console.error("Error in fetchMenu:", err);
      
      // Try to load from cache on error
      const cached = await loadFromCache(id);
      if (cached) {
        setMenuItems(cached.menuItems);
        setMenuData(cached.menuData);
        setRestaurantUserId(cached.userId);
        setOutletId(cached.outletId);
        toast({
          title: "Données en cache utilisées",
          description: "Connexion instable, affichage des données locales.",
        });
        setLoading(false);
        return;
      }

      const errorMessage = err.message || "Erreur lors du chargement du menu";
      setError(errorMessage);
      setMenuItems([]);
      setMenuData(null);
      setRestaurantUserId(null);
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, isOffline, loadFromCache, saveToCache]);

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

  return { menuItems, loading, error, restaurantUserId, menuData, outletId, isOffline };
};

