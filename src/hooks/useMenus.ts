import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useOutlets } from '@/hooks/useOutlets';
import { useOutletContext } from '@/contexts/OutletContext';
import { useOfflineData } from './useOfflineData';
import { toast } from 'sonner';

export interface Menu {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  outlet_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  logo_url?: string;
  header_image_url?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  menu_id: string;
  order_index: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  category_name: string;
  image_url?: string;
  is_available: boolean;
  order_index: number;
  allergens?: string[];
  created_at: string;
  updated_at: string;
}

export const useMenus = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, signOut } = useAuth();
  const { selectedOutletId } = useOutlets();
  const fetchingRef = useRef(false);

  const navigate = useNavigate();
  const tokenExpiredHandledRef = useRef(false);

  // Resolve outletId — also read from localStorage as offline fallback
  const resolvedOutletId = selectedOutletId || localStorage.getItem('selectedOutletId') || undefined;

  // Use offline data for menus
  const { data: menus, isLoading: menusLoading, refetch: refetchMenus, isOffline } = useOfflineData<Menu>({
    table: 'menus',
    queryKey: ['menus'],
    buildQuery: async (userId, outletId) => {
      // Online: filter by outletId if available
      let query = supabase
        .from('menus')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (outletId) {
        query = query.eq('outlet_id', outletId) as typeof query;
      }

      const { data, error } = await query;
      return { data: data as Menu[] | null, error };
    },
    // Enable if user is set — outletId optional (cache fallback works without it)
    enabled: !!user,
  });

  // Fetch categories and items when menus change (with offline cache fallback)
  const fetchCategoriesAndItems = useCallback(async () => {
    // Don't run while menus are still loading — wait for cache to populate
    if (!user || fetchingRef.current || menusLoading) return;
    if (!menus || menus.length === 0) {
      setCategories([]);
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      fetchingRef.current = true;
      setError(null);

      const menuIds = menus.map(menu => menu.id);

      let categoriesData: MenuCategory[] = [];

      if (isOffline) {
        // Offline: load from IndexedDB cache — try with outletId first, then without
        const { getData } = await import('@/lib/offlineStorage');
        const outletIdForCache = resolvedOutletId;
        let cached = outletIdForCache
          ? await getData<MenuCategory[]>('menu_categories', user.id, outletIdForCache)
          : undefined;
        if (!cached || !cached.data || (cached.data as MenuCategory[]).length === 0) {
          cached = await getData<MenuCategory[]>('menu_categories', user.id);
        }
        const all = (cached?.data || []) as MenuCategory[];
        categoriesData = all.filter(c => menuIds.includes(c.menu_id));
        console.log('[Offline] Loaded categories from cache:', categoriesData.length);
      } else {
        const { data, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .in('menu_id', menuIds)
          .order('menu_id')
          .order('order_index', { ascending: true });

        if (categoriesError) throw categoriesError;
        categoriesData = data || [];
      }

      setCategories(categoriesData);

      if (categoriesData.length > 0) {
        const categoryIds = categoriesData.map(cat => cat.id);

        let transformedItems: MenuItem[] = [];

        if (isOffline) {
          const { getData } = await import('@/lib/offlineStorage');
          const outletIdForCache = resolvedOutletId;
          let cachedItems = outletIdForCache
            ? await getData<Record<string, unknown>[]>('menu_items', user.id, outletIdForCache)
            : undefined;
          if (!cachedItems || !cachedItems.data || (cachedItems.data as Record<string, unknown>[]).length === 0) {
            cachedItems = await getData<Record<string, unknown>[]>('menu_items', user.id);
          }
          const allItems = (cachedItems?.data || []) as Record<string, unknown>[];
          const filtered = allItems.filter(item => categoryIds.includes(item.category_id as string));
          const categoryMap = new Map(categoriesData.map(c => [c.id, c.name]));
          transformedItems = filtered.map(item => ({
            id: item.id as string,
            name: item.name as string,
            description: item.description as string | undefined,
            price: Number(item.price),
            category_id: item.category_id as string,
            category_name: categoryMap.get(item.category_id as string) || 'Sans catégorie',
            image_url: item.image_url as string | undefined,
            is_available: item.is_available !== false,
            order_index: Number(item.order_index) || 0,
            allergens: item.allergens as string[] | undefined,
            created_at: item.created_at as string,
            updated_at: item.updated_at as string,
          }));
          console.log('[Offline] Loaded menu items from cache:', transformedItems.length);
        } else {
          const { data: itemsData, error: itemsError } = await supabase
            .from('menu_items')
            .select(`
              *,
              menu_categories!inner(name)
            `)
            .in('category_id', categoryIds)
            .order('category_id')
            .order('order_index', { ascending: true })
            .order('name');

          if (itemsError) throw itemsError;

          transformedItems = (itemsData || []).map(item => ({
            ...item,
            price: Number(item.price),
            category_name: item.menu_categories?.name || 'Sans catégorie'
          }));
        }

        setItems(transformedItems);
      } else {
        setItems([]);
      }

    } catch (error: any) {
      console.error('Error fetching categories/items:', error);
      const code = error?.code;
      const message = error?.message || '';
      
      if ((code === 'PGRST301' || message.includes('JWT expired')) && !tokenExpiredHandledRef.current) {
        tokenExpiredHandledRef.current = true;
        toast.error("Session expirée", { description: "Votre session a expiré. Veuillez vous reconnecter." });
        try {
          await signOut();
        } finally {
          navigate('/auth');
        }
        return;
      }

      setError(message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, menus, isOffline, toast, signOut, navigate]);

  useEffect(() => {
    if (!menusLoading) {
      fetchCategoriesAndItems();
    }
  }, [menus, menusLoading, fetchCategoriesAndItems]);

  useEffect(() => {
    setLoading(menusLoading);
  }, [menusLoading]);

  const createDefaultMenu = useCallback(async () => {
    if (!user) return null;

    try {
      if (!selectedOutletId) {
        toast.error("Erreur", { description: "Aucun point de vente sélectionné" });
        return null;
      }

      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          name: 'Menu Principal',
          description: 'Votre menu principal',
          user_id: user.id,
          outlet_id: selectedOutletId,
          is_active: true
        })
        .select()
        .single();

      if (menuError) throw menuError;

      const defaultCategories = [
        { name: 'Entrées', order_index: 0 },
        { name: 'Plats principaux', order_index: 1 },
        { name: 'Desserts', order_index: 2 },
        { name: 'Boissons', order_index: 3 }
      ];

      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        menu_id: menu.id
      }));

      const { error: categoriesError } = await supabase
        .from('menu_categories')
        .insert(categoriesToInsert);

      if (categoriesError) throw categoriesError;

      toast.success("Menu créé", { description: "Votre menu par défaut a été créé avec succès" });

      await refetchMenus();
      return menu.id;

    } catch (error: any) {
      console.error('Error creating default menu:', error);
      toast.error("Erreur", { description: "Impossible de créer le menu par défaut" });
      return null;
    }
  }, [user?.id, selectedOutletId, toast, refetchMenus]);

  const refetch = useCallback(() => {
    return refetchMenus();
  }, [refetchMenus]);

  const transferMenu = useCallback(async (menuId: string, newOutletId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('menus')
        .update({ outlet_id: newOutletId })
        .eq('id', menuId)
        .eq('user_id', user?.id);

      if (error) {
        toast.error("Erreur", { description: "Impossible de transférer le menu" });
        return false;
      }

      toast.success("Succès", { description: "Menu transféré avec succès" });
      await refetchMenus();
      return true;
    } catch (error) {
      console.error('Error transferring menu:', error);
      toast.error("Erreur", { description: "Une erreur est survenue lors du transfert" });
      return false;
    }
  }, [user?.id, toast, refetchMenus]);

  const fetchAllMenus = useCallback(async (): Promise<Menu[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all menus:', error);
      return [];
    }
  }, [user?.id]);

  const fetchAllCategories = useCallback(async (): Promise<MenuCategory[]> => {
    if (!user) return [];

    try {
      const { data: allMenus } = await supabase
        .from('menus')
        .select('id')
        .eq('user_id', user.id);

      if (!allMenus || allMenus.length === 0) return [];

      const menuIds = allMenus.map(m => m.id);
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .in('menu_id', menuIds)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return [];
    }
  }, [user?.id]);

  return {
    menus,
    categories,
    items,
    loading,
    error,
    isOffline,
    refetch,
    createDefaultMenu,
    transferMenu,
    fetchAllMenus,
    fetchAllCategories
  };
};
