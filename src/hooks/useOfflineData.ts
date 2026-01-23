import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from './useNetworkStatus';
import {
  OfflineDataType,
  storeData,
  getData,
} from '@/lib/offlineStorage';

interface UseOfflineDataOptions<TData> {
  table: OfflineDataType;
  queryKey: string[];
  select?: string;
  buildQuery?: (userId: string, outletId?: string) => Promise<{ data: TData[] | null; error: unknown }>;
  enabled?: boolean;
  staleTime?: number;
}

async function fetchFromSupabase(table: string, select: string, userId: string): Promise<unknown[]> {
  // Completely bypass Supabase's complex type system
  const client = supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (col: string, val: string) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
  const { data, error } = await client.from(table).select(select).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data || [];
}

async function getCachedWithFallback<T>(
  table: OfflineDataType,
  userId: string,
  outletId?: string
) {
  if (!userId) return undefined;
  const scoped = await getData<T>(table, userId, outletId);
  if (scoped?.data !== undefined) return scoped;
  if (outletId) return getData<T>(table, userId);
  return scoped;
}

function filterArrayByOutletIfPossible<T>(data: T[], outletId?: string): T[] {
  if (!outletId) return data;
  if (!Array.isArray(data) || data.length === 0) return data;

  const first: unknown = data[0];
  if (typeof first !== 'object' || first === null) return data;
  if (!('outlet_id' in (first as Record<string, unknown>))) return data;

  return data.filter((item) => {
    if (typeof item !== 'object' || item === null) return true;
    return (item as Record<string, unknown>).outlet_id === outletId;
  });
}

export function useOfflineData<TData>(options: UseOfflineDataOptions<TData>) {
  const {
    table,
    queryKey,
    select = '*',
    buildQuery,
    enabled = true,
    staleTime = 30 * 1000,
  } = options;
  
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();

  const userId = isTeamMember ? teamMemberSession?.ownerId : user?.id;
  const outletId = localStorage.getItem('selectedOutletId') || undefined;

  const fetchData = useCallback(async (): Promise<TData[]> => {
    // Always try to get cached data first (with fallback to non outlet-scoped cache)
    const cached = await getCachedWithFallback<TData[]>(table, userId || '', outletId);
    const cachedList = filterArrayByOutletIfPossible((cached?.data || []) as TData[], outletId);
    
    if (isOffline) {
      // Return cached data in offline mode
      console.log(`[Offline] Loading ${table} from cache:`, cachedList.length, 'items');
      return cachedList;
    }

    // Online: try to fetch fresh data
    try {
      let freshData: TData[];
      
      if (buildQuery) {
        const result = await buildQuery(userId || '', outletId);
        if (result.error) throw result.error;
        freshData = result.data || [];
      } else {
        const data = await fetchFromSupabase(table, select, userId || '');
        freshData = data as TData[];
      }
      
      // Store for offline use
      await storeData(table, freshData, userId || '', outletId);
      console.log(`[Online] Cached ${table}:`, freshData.length, 'items');
      return freshData;
    } catch (error) {
      // Network error while online - fallback to cache
      console.warn(`[Fallback] Network error for ${table}, using cache:`, error);
      if (cachedList.length) {
        return cachedList;
      }
      throw error;
    }
  }, [table, select, buildQuery, userId, outletId, isOffline]);

  const query = useQuery({
    queryKey: [...queryKey, userId, outletId],
    queryFn: fetchData,
    enabled: enabled && !!userId,
    staleTime,
    gcTime: 24 * 60 * 60 * 1000,
    networkMode: 'offlineFirst',
  });

  useEffect(() => {
    if (!userId || isOffline) return;
    const channel = supabase
      .channel(`${table}_changes_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: [...queryKey, userId, outletId] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [table, userId, outletId, isOffline, queryKey, queryClient]);

  return { data: query.data || [], isLoading: query.isLoading, isError: query.isError, error: query.error, refetch: query.refetch, isOffline };
}

export async function preloadCriticalData(userId: string, outletId?: string): Promise<void> {
  const logPrefix = '[Offline]';
  if (!userId) return;

  console.log(`${logPrefix} Preloading critical data for user:`, userId);

  // NOTE: we store preloaded data WITHOUT outlet scoping.
  // This prevents empty caches when selectedOutletId changes or is not set yet.
  // useOfflineData will filter by outletId client-side when possible.

  const safeFetchAndStore = async (table: OfflineDataType) => {
    try {
      const data = await fetchFromSupabase(table, '*', userId);
      await storeData(table, data, userId);
      console.log(`${logPrefix} Preloaded ${table}:`, data.length, 'items');
    } catch (error) {
      console.warn(`${logPrefix} Failed to preload ${table}:`, error);
    }
  };

  // Fetch menus first (needed to fetch categories/items which don't have user_id)
  let menus: Array<{ id: string }> = [];
  try {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    menus = (data || []) as Array<{ id: string }>;
    await storeData('menus', data || [], userId);
    console.log(`${logPrefix} Preloaded menus:`, (data || []).length, 'items');
  } catch (error) {
    console.warn(`${logPrefix} Failed to preload menus:`, error);
  }

  // menu_categories (no user_id)
  let categories: Array<{ id: string }> = [];
  try {
    const menuIds = menus.map(m => m.id).filter(Boolean);
    if (menuIds.length > 0) {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .in('menu_id', menuIds);
      if (error) throw error;
      categories = (data || []) as Array<{ id: string }>;
      await storeData('menu_categories', data || [], userId);
      console.log(`${logPrefix} Preloaded menu_categories:`, (data || []).length, 'items');
    } else {
      await storeData('menu_categories', [], userId);
    }
  } catch (error) {
    console.warn(`${logPrefix} Failed to preload menu_categories:`, error);
  }

  // menu_items (no user_id)
  try {
    const categoryIds = categories.map(c => c.id).filter(Boolean);
    if (categoryIds.length > 0) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds);
      if (error) throw error;
      await storeData('menu_items', data || [], userId);
      console.log(`${logPrefix} Preloaded menu_items:`, (data || []).length, 'items');
    } else {
      await storeData('menu_items', [], userId);
    }
  } catch (error) {
    console.warn(`${logPrefix} Failed to preload menu_items:`, error);
  }

  // Other user-scoped tables (these all have user_id)
  await Promise.allSettled([
    safeFetchAndStore('outlets'),
    safeFetchAndStore('inventory_items'),
    safeFetchAndStore('business_customers'),
    safeFetchAndStore('invoice_settings'),
    safeFetchAndStore('suppliers'),
    safeFetchAndStore('table_sessions'),
    safeFetchAndStore('orders'),
    safeFetchAndStore('invoices'),
    safeFetchAndStore('reservations'),
    safeFetchAndStore('customers'),
    safeFetchAndStore('transactions'),
  ]);

  console.log(`${logPrefix} Preloading complete`, { outletId });
}
