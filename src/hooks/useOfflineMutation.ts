import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from './useNetworkStatus';
import { toast } from './use-toast';
import { OfflineDataType, queueMutation, generateLocalId, storeData, getData } from '@/lib/offlineStorage';
import { syncEngine } from '@/lib/syncEngine';

interface UseOfflineMutationOptions {
  table: OfflineDataType;
  queryKey: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useOfflineInsert<T extends Record<string, unknown>>(options: UseOfflineMutationOptions) {
  const { table, queryKey, onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const resolvedUserId = isTeamMember ? (teamMemberSession?.ownerId || '') : (user?.id || '');

  return useMutation({
    mutationFn: async (variables: T): Promise<T> => {
      const localId = generateLocalId();
      const outletId = localStorage.getItem('selectedOutletId') || undefined;
      const dataWithId = { ...variables, id: localId, user_id: resolvedUserId, outlet_id: outletId, created_at: new Date().toISOString() };

      if (isOffline) {
        await queueMutation({ table, operation: 'insert', data: dataWithId, localId, userId: resolvedUserId, outletId, maxRetries: 3, conflictResolution: 'client-wins' });
        const userId = resolvedUserId;
        const cached = (await getData<T[]>(table, userId, outletId)) ?? (outletId ? await getData<T[]>(table, userId) : undefined);
        await storeData(table, [...(cached?.data || []), dataWithId as T], userId, outletId);
        toast({ title: 'Enregistré localement', description: 'Sera synchronisé à la reconnexion' });
        return dataWithId as T;
      }

      const { data, error } = await supabase.from(table).insert(variables as never).select().single();
      if (error) throw error;
      return data as unknown as T;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); onSuccess?.(); },
    onError: (error: Error) => { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); onError?.(error); },
  });
}

export function useOfflineUpdate<T extends Record<string, unknown>>(options: UseOfflineMutationOptions) {
  const { table, queryKey, onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const resolvedUserId = isTeamMember ? (teamMemberSession?.ownerId || '') : (user?.id || '');

  return useMutation({
    mutationFn: async (variables: T & { id: string }): Promise<T> => {
      const outletId = localStorage.getItem('selectedOutletId') || undefined;
      if (isOffline) {
        await queueMutation({ table, operation: 'update', data: variables, localId: variables.id, userId: resolvedUserId, outletId, maxRetries: 3, conflictResolution: 'client-wins' });
        const userId = resolvedUserId;
        const cached = (await getData<T[]>(table, userId, outletId)) ?? (outletId ? await getData<T[]>(table, userId) : undefined);
        if (cached?.data) {
          await storeData(
            table,
            cached.data.map(item => (item as { id?: string }).id === variables.id ? { ...item, ...variables } : item),
            userId,
            outletId
          );
        }
        toast({ title: 'Modifié localement' });
        return variables as T;
      }
      const { data, error } = await supabase.from(table).update(variables as never).eq('id', variables.id).select().single();
      if (error) throw error;
      return data as unknown as T;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); onSuccess?.(); },
    onError: (error: Error) => { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); onError?.(error); },
  });
}

export function useOfflineDelete(options: UseOfflineMutationOptions) {
  const { table, queryKey, onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();

  return useMutation({
    mutationFn: async (id: string) => {
      const outletId = localStorage.getItem('selectedOutletId') || undefined;
      if (isOffline) {
        await queueMutation({ table, operation: 'delete', data: { id }, localId: id, userId: user?.id || '', outletId, maxRetries: 3, conflictResolution: 'client-wins' });
        const userId = user?.id || '';
        const cached = (await getData<{ id: string }[]>(table, userId, outletId)) ?? (outletId ? await getData<{ id: string }[]>(table, userId) : undefined);
        if (cached?.data) await storeData(table, cached.data.filter(item => item.id !== id), userId, outletId);
        toast({ title: 'Supprimé localement' });
        return { id };
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); onSuccess?.(); },
    onError: (error: Error) => { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); onError?.(error); },
  });
}

export function useSync() {
  const queryClient = useQueryClient();
  const sync = useCallback(async () => {
    const result = await syncEngine.forceSync();
    if (result.synced > 0) { queryClient.invalidateQueries(); toast({ title: 'Synchronisation terminée', description: `${result.synced} élément(s)` }); }
    if (result.failed > 0) toast({ title: 'Erreurs', description: `${result.failed} erreur(s)`, variant: 'destructive' });
    return result;
  }, [queryClient]);
  return { sync, retryFailed: useCallback(() => syncEngine.retryFailed(), []) };
}
