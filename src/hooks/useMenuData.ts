import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/types/menu';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

// ---- Lightweight cache via localStorage (synchronous → instant display) ----
const CACHE_PREFIX = 'publicMenu_v2_';

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

function readMenuCache(menuId: string): CachedMenuData | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + menuId);
    if (!raw) return null;
    return JSON.parse(raw) as CachedMenuData;
  } catch { return null; }
}

function writeMenuCache(menuId: string, data: CachedMenuData) {
  try {
    localStorage.setItem(CACHE_PREFIX + menuId, JSON.stringify(data));
  } catch { /* quota exceeded – ignore */ }
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

  const fetchMenu = useCallback(async (id: string) => {
    setError(null);

    // 1. CACHE SYNCHRONE : affichage immédiat sans attendre le réseau
    const cached = readMenuCache(id);
    if (cached && cached.menuItems.length > 0) {
      setMenuItems(cached.menuItems);
      setMenuData(cached.menuData);
      setRestaurantUserId(cached.userId);
      setOutletId(cached.outletId);
      setLoading(false); // Montrer immédiatement depuis le cache

      if (isOffline) return; // Hors ligne → on s'arrête ici
      // En ligne → continuer en arrière-plan pour rafraîchir
    } else if (isOffline) {
      // Pas de cache et hors ligne
      setError("Mode hors ligne - Aucune donnée en cache pour ce menu");
      setLoading(false);
      return;
    }

    // 2. En ligne : charger menu + catégories en parallèle
    try {
      const [menuResult, categoriesResult] = await Promise.all([
        (supabase as any).rpc('get_public_menu_data', { _menu_id: id }),
        supabase
          .from('menu_categories')
          .select('id, name')
          .eq('menu_id', id)
          .order('order_index', { ascending: true }),
      ]);

      if (menuResult.error) throw new Error("Erreur lors de la récupération du menu");
      const menuRows = Array.isArray(menuResult.data) ? menuResult.data : [];
      if (menuRows.length === 0) throw new Error("Menu non trouvé ou inactif");

      const menuDataResult = menuRows[0];
      const newMenuData: MenuData = {
        id,
        name: menuDataResult.name,
        description: menuDataResult.description || undefined,
        logo_url: menuDataResult.logo_url || undefined,
        header_image_url: menuDataResult.header_image_url || undefined,
        outlet_id: menuDataResult.outlet_id || undefined,
      };

      setRestaurantUserId(menuDataResult.user_id);
      setOutletId(menuDataResult.outlet_id || null);
      setMenuData(newMenuData);

      if (categoriesResult.error) throw new Error("Erreur lors de la récupération des catégories");

      const categoriesData = categoriesResult.data || [];

      if (categoriesData.length === 0) {
        setMenuItems([]);
        writeMenuCache(id, { menuItems: [], menuData: newMenuData, userId: menuDataResult.user_id, outletId: menuDataResult.outlet_id });
        setLoading(false);
        return;
      }

      const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]));
      const categoryIds = categoriesData.map((c: any) => c.id);

      // 3. Charger les plats
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, is_available, category_id, order_index')
        .in('category_id', categoryIds)
        .order('order_index', { ascending: true });

      if (itemsError) throw new Error("Erreur lors de la récupération des plats");

      const availableItems = (menuItemsData || []).filter((item: any) => item.is_available !== false);
      const itemIds = availableItems.map((i: any) => i.id);

      // 3b. Charger les groupes d'options + valeurs
      const groupsByItem: Record<string, any[]> = {};
      if (itemIds.length > 0) {
        const { data: groupsData } = await (supabase as any)
          .from('menu_item_option_groups')
          .select('id, menu_item_id, name, selection_type, is_required, order_index')
          .in('menu_item_id', itemIds)
          .order('order_index', { ascending: true });

        const groupIds = (groupsData || []).map((g: any) => g.id);
        const valuesByGroup: Record<string, any[]> = {};
        if (groupIds.length > 0) {
          const { data: valuesData } = await (supabase as any)
            .from('menu_item_option_values')
            .select('id, group_id, name, extra_price, is_available, order_index')
            .in('group_id', groupIds)
            .order('order_index', { ascending: true });
          for (const v of valuesData || []) {
            if (v.is_available === false) continue;
            (valuesByGroup[v.group_id] ||= []).push({
              id: v.id,
              name: v.name,
              extra_price: Number(v.extra_price) || 0,
            });
          }
        }
        for (const g of groupsData || []) {
          (groupsByItem[g.menu_item_id] ||= []).push({
            id: g.id,
            name: g.name,
            selection_type: g.selection_type,
            is_required: !!g.is_required,
            values: valuesByGroup[g.id] || [],
          });
        }
      }

      const transformedItems: MenuItem[] = availableItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        image_url: item.image_url || undefined,
        category_name: categoryMap.get(item.category_id) || 'Autres',
        is_available: true,
        option_groups: groupsByItem[item.id] || [],
      }));

      setMenuItems(transformedItems);

      writeMenuCache(id, {
        menuItems: transformedItems,
        menuData: newMenuData,
        userId: menuDataResult.user_id,
        outletId: menuDataResult.outlet_id,
      });

    } catch (err: any) {
      console.error("Error in fetchMenu:", err);

      // Fallback sur le cache en cas d'erreur réseau
      const fallback = readMenuCache(id);
      if (fallback && fallback.menuItems.length > 0) {
        setMenuItems(fallback.menuItems);
        setMenuData(fallback.menuData);
        setRestaurantUserId(fallback.userId);
        setOutletId(fallback.outletId);
        // Pas de toast intrusif – les données sont là
      } else {
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
      }
    } finally {
      setLoading(false);
    }
  }, [toast, isOffline]);

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
