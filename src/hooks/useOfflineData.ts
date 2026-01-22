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
    // Always try to get cached data first
    const cached = await getData<TData[]>(table, userId || '', outletId);
    
    if (isOffline) {
      // Return cached data in offline mode
      console.log(`[Offline] Loading ${table} from cache:`, cached?.data?.length || 0, 'items');
      return cached?.data || [];
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
      if (cached?.data) {
        return cached.data;
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
  // All critical tables that need to work offline
  const tables: OfflineDataType[] = [
    'menus', 
    'menu_categories', 
    'menu_items', 
    'inventory_items', 
    'business_customers', 
    'invoice_settings', 
    'suppliers',
    'outlets',         // Needed for outlet selection & route guards
    'table_sessions',  // Critical for Tables page
    'orders',          // Critical for Orders page  
    'invoices',        // Critical for Invoices page
    'reservations',    // Critical for Reservations page
    'customers',       // Critical for Clients page
    'transactions',    // Critical for Accounting page
  ];
  
  console.log('[Offline] Preloading critical data for user:', userId);
  
  await Promise.allSettled(tables.map(async (table) => {
    try {
      const data = await fetchFromSupabase(table, '*', userId);
      if (data) {
        // Some tables should NOT be scoped by outlet in storage (ex: outlets)
        const storageOutletId = table === 'outlets' ? undefined : outletId;
        await storeData(table, data, userId, storageOutletId);
        console.log(`[Offline] Preloaded ${table}:`, data.length, 'items');
      }
    } catch (error) {
      console.warn(`[Offline] Failed to preload ${table}:`, error);
    }
  }));
  
  console.log('[Offline] Preloading complete');
}
