import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from './useNetworkStatus';
import {
  OfflineDataType,
  QueuedMutation,
  storeData,
  getData,
  getPendingMutations,
} from '@/lib/offlineStorage';
import { getSelectedOutletIdFromStorage, resolveOfflineUserId, sanitizeStorageId } from '@/lib/offlineIdentity';

interface UseOfflineDataOptions<TData> {
  table: OfflineDataType;
  queryKey: string[];
  select?: string;
  buildQuery?: (userId: string, outletId?: string) => Promise<{ data: TData[] | null; error: unknown }>;
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean | 'always';
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
  const unscoped = outletId ? await getData<T>(table, userId) : undefined;

  const scopedData = scoped?.data as unknown;
  const unscopedData = unscoped?.data as unknown;

  if (Array.isArray(scopedData) || Array.isArray(unscopedData)) {
    const merged = [
      ...(Array.isArray(scopedData) ? scopedData : []),
      ...(Array.isArray(unscopedData) ? unscopedData : []),
    ];

    const deduped = Array.from(
      new Map(
        merged.map((item, index) => {
          if (item && typeof item === 'object' && 'id' in (item as Record<string, unknown>)) {
            return [String((item as Record<string, unknown>).id), item] as const;
          }
          return [`__idx_${index}`, item] as const;
        })
      ).values()
    );

    if (deduped.length > 0) {
      return {
        ...(scoped || unscoped || {}),
        data: deduped as T,
      };
    }
  }

  if (scopedData !== undefined && scopedData !== null) return scoped;
  if (unscopedData !== undefined && unscopedData !== null) return unscoped;
  return scoped ?? unscoped;
}

// Tables soumises à un scoping outlet strict — aucune fuite tolérée
const STRICT_OUTLET_TABLES: ReadonlySet<string> = new Set([
  'table_sessions',
  'orders',
  'invoices',
  'transactions',
]);

function filterArrayByOutletIfPossible<T>(data: T[], outletId?: string, table?: string): T[] {
  if (!outletId) return data;
  if (!Array.isArray(data) || data.length === 0) return data;

  const first: unknown = data[0];
  if (typeof first !== 'object' || first === null) return data;
  if (!('outlet_id' in (first as Record<string, unknown>))) return data;

  const isStrict = table ? STRICT_OUTLET_TABLES.has(table) : false;

  return data.filter((item) => {
    if (typeof item !== 'object' || item === null) return true;
    const itemOutletId = (item as Record<string, unknown>).outlet_id;

    // STRICT: pour table_sessions/orders/invoices/transactions, REJETER tout
    // ce qui n'est pas exactement le bon outlet, y compris les null.
    if (isStrict) {
      return itemOutletId === outletId;
    }

    if (itemOutletId === null || typeof itemOutletId === 'undefined') {
      const tableLike = (item as Record<string, unknown>);
      if ('table_number' in tableLike || 'session_id' in tableLike) {
        return false;
      }
      return true;
    }

    return itemOutletId === outletId;
  });
}

function getMutationRecordId(mutation: QueuedMutation): string | undefined {
  const value = mutation.data?.id;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

async function getScopedPendingMutations(
  table: OfflineDataType,
  userId: string,
  outletId?: string
): Promise<QueuedMutation[]> {
  if (!userId) return [];

  const allPending = await getPendingMutations();
  return allPending.filter((mutation) => {
    if (mutation.table !== table) return false;
    if (mutation.userId !== userId) return false;
    if (!outletId) return true;
    // STRICT: only include mutations for THIS outlet (not null/undefined)
    return mutation.outletId === outletId;
  });
}

function mergeFreshWithPending<T extends Record<string, unknown>>(
  freshData: T[],
  cachedData: T[],
  pendingMutations: QueuedMutation[]
): T[] {
  const byId = new Map<string, T>();

  for (const item of freshData) {
    const id = typeof item?.id === 'string' ? item.id : undefined;
    if (id) byId.set(id, item);
  }

  for (const item of cachedData) {
    const id = typeof item?.id === 'string' ? item.id : undefined;
    if (id && !byId.has(id)) byId.set(id, item);
  }

  for (const mutation of pendingMutations) {
    const id = getMutationRecordId(mutation);
    if (!id) continue;

    if (mutation.operation === 'delete') {
      byId.delete(id);
      continue;
    }

    const cached = byId.get(id);
    byId.set(id, {
      ...(cached || ({} as T)),
      ...(mutation.data as T),
      id,
    });
  }

  return Array.from(byId.values());
}

export function useOfflineData<TData>(options: UseOfflineDataOptions<TData>) {
  const {
    table,
    queryKey,
    select = '*',
    buildQuery,
    enabled = true,
    staleTime = 30 * 1000,
    refetchOnMount,
  } = options;
  
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();

  const userId = resolveOfflineUserId({
    userId: user?.id,
    isTeamMember,
    ownerId: teamMemberSession?.ownerId,
  });
  const outletId = getSelectedOutletIdFromStorage();

  const fetchData = useCallback(async (): Promise<TData[]> => {
    if (!userId) return [];

    // Always try to get cached data first (with fallback to non outlet-scoped cache)
    const cached = await getCachedWithFallback<TData[]>(table, userId, outletId);
    const cachedList = filterArrayByOutletIfPossible((cached?.data || []) as TData[], outletId, table);
    
    if (isOffline) {
      // Return cached data in offline mode
      console.log(`[Offline] Loading ${table} from cache:`, cachedList.length, 'items');
      return cachedList;
    }

    // Online: try to fetch fresh data
    try {
      let freshData: TData[];
      
      if (buildQuery) {
        const result = await buildQuery(userId, outletId);
        if (result.error) throw result.error;
        freshData = result.data || [];
      } else {
        const data = await fetchFromSupabase(table, select, userId);
        freshData = data as TData[];
      }

      const pendingMutations = await getScopedPendingMutations(table, userId, outletId);
      const shouldProtectLocalState = pendingMutations.length > 0 && Array.isArray(freshData);

      const finalData = shouldProtectLocalState
        ? mergeFreshWithPending(
            freshData as Array<Record<string, unknown>>,
            cachedList as Array<Record<string, unknown>>,
            pendingMutations
          ) as unknown as TData[]
        : freshData;
      
      // Store for offline use — filter by outlet to prevent cross-outlet cache contamination
      const dataToStore = filterArrayByOutletIfPossible(finalData as unknown as Record<string, unknown>[], outletId, table) as unknown as TData[];
      await storeData(table, dataToStore, userId, outletId);
      console.log(`[Online] Cached ${table}:`, dataToStore.length, 'items', shouldProtectLocalState ? '(merge pending)' : '');
      return finalData;
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
    refetchOnMount,
  });

  // Stable channel name (no Date.now() to avoid duplicate subscriptions)
  const queryKeyString = queryKey.join('_');

  useEffect(() => {
    if (!userId || isOffline) return;

    const channelName = `offline_${table}_${userId}`;

    // Supabase throws if you subscribe the same channel name twice.
    // Remove any previous channel with the same name before creating a new one.
    const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: queryKey.concat([userId, outletId]) });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, outletId, isOffline, queryKeyString]);

  return { data: query.data || [], isLoading: query.isLoading, isError: query.isError, error: query.error, refetch: query.refetch, isOffline };
}

export async function preloadCriticalData(userId: string, outletId?: string): Promise<void> {
  const logPrefix = '[Offline]';
  const normalizedUserId = sanitizeStorageId(userId);
  const normalizedOutletId = sanitizeStorageId(outletId);
  if (!normalizedUserId) return;

  console.log(`${logPrefix} Preloading critical data for user:`, normalizedUserId, '| outlet:', normalizedOutletId);

  const getRecordOutletId = (record: unknown): string | undefined => {
    if (!record || typeof record !== 'object') return undefined;
    const outletValue = (record as Record<string, unknown>).outlet_id;
    return typeof outletValue === 'string' ? sanitizeStorageId(outletValue) : undefined;
  };

  const storeOutletScopedCopies = async (table: OfflineDataType, data: unknown[]) => {
    const records = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
    const outletIds = new Set<string>();

    if (normalizedOutletId) {
      outletIds.add(normalizedOutletId);
    }

    for (const record of records) {
      const recordOutletId = getRecordOutletId(record);
      if (recordOutletId) {
        outletIds.add(recordOutletId);
      }
    }

    await Promise.all(
      Array.from(outletIds).map((currentOutletId) => {
        const scoped = records.filter((record) => {
          const recordOutletId = getRecordOutletId(record);
          return !recordOutletId || recordOutletId === currentOutletId;
        });

        return storeData(table, scoped, normalizedUserId, currentOutletId);
      })
    );
  };

  const safeFetchAndStore = async (table: OfflineDataType, fetchFn?: () => Promise<unknown[]>) => {
    try {
      let data: unknown[];
      if (fetchFn) {
        data = await fetchFn();
      } else {
        data = await fetchFromSupabase(table, '*', normalizedUserId);
      }

      const normalizedFresh = Array.isArray(data) ? data : [];
      const cached = await getCachedWithFallback<unknown[]>(table, normalizedUserId, normalizedOutletId);
      const cachedList = Array.isArray(cached?.data) ? cached.data : [];
      const pendingMutations = await getScopedPendingMutations(table, normalizedUserId, normalizedOutletId);

      const finalData = pendingMutations.length > 0
        ? mergeFreshWithPending(
            normalizedFresh as Array<Record<string, unknown>>,
            cachedList as Array<Record<string, unknown>>,
            pendingMutations
          )
        : normalizedFresh;

      await storeData(table, finalData, normalizedUserId);
      await storeOutletScopedCopies(table, finalData);

      console.log(
        `${logPrefix} Preloaded ${table}:`,
        finalData.length,
        'items',
        pendingMutations.length > 0 ? '(merge pending)' : ''
      );
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
      .eq('user_id', normalizedUserId);
    if (error) throw error;
    menus = (data || []) as Array<{ id: string }>;
    await storeData('menus', data || [], normalizedUserId);
    await storeOutletScopedCopies('menus', data || []);
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
      await storeData('menu_categories', data || [], normalizedUserId);
      console.log(`${logPrefix} Preloaded menu_categories:`, (data || []).length, 'items');
    } else {
      await storeData('menu_categories', [], normalizedUserId);
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
      await storeData('menu_items', data || [], normalizedUserId);
      console.log(`${logPrefix} Preloaded menu_items:`, (data || []).length, 'items');
    } else {
      await storeData('menu_items', [], normalizedUserId);
    }
  } catch (error) {
    console.warn(`${logPrefix} Failed to preload menu_items:`, error);
  }

  // All user-scoped tables in parallel
  await Promise.allSettled([
    safeFetchAndStore('outlets'),
    safeFetchAndStore('inventory_items'),
    safeFetchAndStore('business_customers'),
    safeFetchAndStore('invoice_settings'),
    safeFetchAndStore('suppliers'),
    safeFetchAndStore('business_periods', async () => {
      const { data } = await supabase
        .from('business_periods')
        .select('*')
        .eq('user_id', normalizedUserId)
        .order('started_at', { ascending: false })
        .limit(100);
      return data || [];
    }),
    safeFetchAndStore('table_sessions', async () => {
      const { data } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('user_id', normalizedUserId)
        .order('started_at', { ascending: false })
        .limit(200);
      return data || [];
    }),
    safeFetchAndStore('orders', async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', normalizedUserId)
        .order('created_at', { ascending: false })
        .limit(500);
      return data || [];
    }),
    safeFetchAndStore('invoices', async () => {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', normalizedUserId)
        .order('created_at', { ascending: false })
        .limit(500);
      return data || [];
    }),
    safeFetchAndStore('reservations'),
    safeFetchAndStore('customers'),
    safeFetchAndStore('transactions', async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', normalizedUserId)
        .order('date', { ascending: false })
        .limit(500);
      return data || [];
    }),
    safeFetchAndStore('debtor_payments'),
    safeFetchAndStore('events'),
  ]);

  // Store outlet-specific data if outletId is known
  if (normalizedOutletId) {
    console.log(`${logPrefix} Storing outlet-scoped data for outlet:`, normalizedOutletId);
  }

  console.log(`${logPrefix} ✅ Preloading complete`);
}
