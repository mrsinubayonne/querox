import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { supabase } from '@/integrations/supabase/client';
import { getData } from '@/lib/offlineStorage';
import type { MenuItem } from '@/types/menu';
import { getSelectedOutletIdFromStorage, resolveOfflineUserId } from '@/lib/offlineIdentity';

/**
 * Hook for loading menu items in internal (authenticated) contexts like Tables.
 * Uses IndexedDB-first strategy with Supabase background refresh.
 * NOT for public-facing menus (use useMenuData instead).
 */
// Cache mémoire partagé : évite de recharger les plats à chaque ouverture du modal.
const menuItemsMemoryCache = new Map<string, MenuItem[]>();

export const useInternalMenuItems = (isActive: boolean) => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { outletId } = useRestaurant();
  const { isOffline } = useNetworkStatus();
  const cacheKey = `${user?.id || ''}|${outletId || ''}`;
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => menuItemsMemoryCache.get(cacheKey) || []);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const loadMenuItems = useCallback(async () => {
    const resolvedUserId = resolveOfflineUserId({
      userId: user?.id,
      isTeamMember,
      ownerId: teamMemberSession?.ownerId,
    });
    if (!resolvedUserId || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const resolvedOutletId = outletId || getSelectedOutletIdFromStorage();
      const outletKey = resolvedOutletId || undefined;

      // --- Step 1: Always load from IndexedDB first (instant display) ---
      const buildItemsFromCache = async (): Promise<MenuItem[]> => {
        let cachedMenus = await getData<Record<string, unknown>[]>('menus', resolvedUserId, outletKey);
        if (!cachedMenus?.data || (cachedMenus.data as any[]).length === 0) {
          cachedMenus = await getData<Record<string, unknown>[]>('menus', resolvedUserId);
        }
        const menusData = (cachedMenus?.data || []) as Array<{ id: string; outlet_id?: string }>;
        const outletMenuIds = resolvedOutletId
          ? menusData.filter(m => !m.outlet_id || m.outlet_id === resolvedOutletId).map(m => m.id)
          : menusData.map(m => m.id);

        if (outletMenuIds.length === 0) return [];

        if (!localStorage.getItem('activeMenuId')) {
          localStorage.setItem('activeMenuId', outletMenuIds[0]);
        }

        let cachedCategories = await getData<Record<string, unknown>[]>('menu_categories', resolvedUserId, outletKey);
        if (!cachedCategories?.data || (cachedCategories.data as any[]).length === 0) {
          cachedCategories = await getData<Record<string, unknown>[]>('menu_categories', resolvedUserId);
        }
        const categoriesData = (cachedCategories?.data || []) as Array<{ id: string; name: string; menu_id: string }>;
        const filteredCategories = categoriesData.filter(c => outletMenuIds.includes(c.menu_id));
        const categoryIds = filteredCategories.map(c => c.id);
        const categoryMap = new Map(filteredCategories.map(c => [c.id, c.name]));

        let cachedItems = await getData<Record<string, unknown>[]>('menu_items', resolvedUserId, outletKey);
        if (!cachedItems?.data || (cachedItems.data as any[]).length === 0) {
          cachedItems = await getData<Record<string, unknown>[]>('menu_items', resolvedUserId);
        }
        const allItems = (cachedItems?.data || []) as Record<string, unknown>[];

        return allItems
          .filter(item => categoryIds.includes(item.category_id as string) && item.is_available !== false)
          .map(item => ({
            id: item.id as string,
            name: item.name as string,
            description: (item.description as string) || '',
            price: Number(item.price),
            category_name: categoryMap.get(item.category_id as string) || 'Sans catégorie',
            image_url: item.image_url as string | undefined,
            is_available: true,
            option_groups: [],
          }));
      };

      const cachedItems = await buildItemsFromCache();
      if (cachedItems.length > 0) {
        setMenuItems(cachedItems);
        menuItemsMemoryCache.set(cacheKey, cachedItems);
      }

      // --- Step 2: If online, refresh from Supabase ---
      if (!isOffline) {
        try {
          let { data: menu } = await supabase
            .from('menus')
            .select('id')
            .eq('user_id', resolvedUserId)
            .eq('is_active', true)
            .eq('outlet_id', resolvedOutletId)
            .limit(1)
            .maybeSingle();

          if (!menu) {
            const fallback = await supabase
              .from('menus')
              .select('id')
              .eq('user_id', resolvedUserId)
              .eq('is_active', true)
              .limit(1)
              .maybeSingle();
            menu = fallback.data as any;
          }

          if (!menu) return;
          const menuId = (menu as any).id;
          localStorage.setItem('activeMenuId', menuId);

          const { data: categories } = await supabase
            .from('menu_categories')
            .select('id, name')
            .eq('menu_id', menuId);

          if (!categories || categories.length === 0) return;
          const catIds = categories.map(c => c.id);
          const catMap = new Map(categories.map(c => [c.id, c.name]));

          const { data: freshItems } = await supabase
            .from('menu_items')
            .select('id, name, description, price, image_url, is_available, category_id, is_custom_price, is_custom_name')
            .in('category_id', catIds)
            .neq('is_available', false);

          if (freshItems && freshItems.length > 0) {
            const itemIds = freshItems.map(i => i.id);
            const groupsByItem = new Map<string, any[]>();
            try {
              const { data: groupsData } = await (supabase as any)
                .from('menu_item_option_groups')
                .select('id, menu_item_id, name, selection_type, is_required, order_index')
                .in('menu_item_id', itemIds)
                .order('order_index');
              const groupIds = (groupsData || []).map((g: any) => g.id);
              let valuesData: any[] = [];
              if (groupIds.length > 0) {
                const { data: vals } = await (supabase as any)
                  .from('menu_item_option_values')
                  .select('id, group_id, name, extra_price, is_available, order_index')
                  .in('group_id', groupIds)
                  .order('order_index');
                valuesData = vals || [];
              }
              for (const g of groupsData || []) {
                const arr = groupsByItem.get(g.menu_item_id) || [];
                arr.push({ ...g, values: valuesData.filter((v: any) => v.group_id === g.id && v.is_available !== false) });
                groupsByItem.set(g.menu_item_id, arr);
              }
            } catch (err) {
              console.warn('[useInternalMenuItems] Option groups load failed:', err);
            }

            const items: MenuItem[] = freshItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: Number(item.price),
              category_name: catMap.get(item.category_id) || 'Autres',
              image_url: item.image_url || undefined,
              is_available: true,
              is_custom_price: item.is_custom_price ?? false,
              is_custom_name: item.is_custom_name ?? false,
              option_groups: groupsByItem.get(item.id) || [],
            }));
            setMenuItems(items);
            menuItemsMemoryCache.set(cacheKey, items);
          }
        } catch (err) {
          console.warn('[useInternalMenuItems] Online refresh failed, keeping cached data:', err);
        }
      }
    } catch (err) {
      console.warn('[useInternalMenuItems] Failed to load menu items:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [user?.id, isTeamMember, teamMemberSession?.ownerId, outletId, isOffline]);

  useEffect(() => {
    if (isActive && user) {
      loadMenuItems();
    }
  }, [isActive, user, outletId, isOffline, loadMenuItems]);

  return { menuItems, loading, isOffline };
};
