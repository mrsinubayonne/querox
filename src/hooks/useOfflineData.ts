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
    if (isOffline) {
      const cached = await getData<TData[]>(table, userId || '', outletId);
      return cached?.data || [];
    }

    if (buildQuery) {
      const result = await buildQuery(userId || '', outletId);
      if (result.error) throw result.error;
      const data = result.data || [];
      await storeData(table, data, userId || '', outletId);
      return data;
    }

    const { data, error } = await supabase.from(table).select(select).eq('user_id', userId);
    if (error) throw error;
    await storeData(table, data as TData[], userId || '', outletId);
    return data as TData[];
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
  const tables: OfflineDataType[] = ['menus', 'menu_categories', 'menu_items', 'inventory_items', 'business_customers', 'invoice_settings', 'suppliers'];
  await Promise.allSettled(tables.map(async (table) => {
    const { data } = await supabase.from(table).select('*').eq('user_id', userId);
    if (data) await storeData(table, data, userId, outletId);
  }));
}
