import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from './useNetworkStatus';
import { toast } from 'sonner';
import { getData, storeData, queueMutation, generateLocalId } from '@/lib/offlineStorage';

/**
 * Hook qui démarre automatiquement une période d'activité lorsqu'une transaction
 * ou facture est payée alors qu'aucune période n'est active.
 * Fonctionne aussi en mode hors ligne via IndexedDB.
 */
type OfflineBusinessPeriod = {
  id: string;
  ended_at: string | null;
  outlet_id?: string | null;
  [key: string]: unknown;
};

const normalizeOfflinePeriods = (value: unknown): OfflineBusinessPeriod[] => {
  if (Array.isArray(value)) {
    return value as OfflineBusinessPeriod[];
  }

  if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    return [value as OfflineBusinessPeriod];
  }

  return [];
};

const getOfflinePeriodsForOutlet = async (userId: string, outletId: string): Promise<OfflineBusinessPeriod[]> => {
  try {
    const scoped = await getData<OfflineBusinessPeriod[] | OfflineBusinessPeriod>('business_periods', userId, outletId);
    const scopedPeriods = normalizeOfflinePeriods(scoped?.data);
    if (scopedPeriods.length > 0) {
      return scopedPeriods;
    }

    const unscoped = await getData<OfflineBusinessPeriod[] | OfflineBusinessPeriod>('business_periods', userId);
    return normalizeOfflinePeriods(unscoped?.data).filter(
      (period) => !period.outlet_id || period.outlet_id === outletId
    );
  } catch (error) {
    console.warn('[Offline] Impossible de lire le cache business_periods (auto-start):', error);
    return [];
  }
};

const upsertOfflinePeriodInCaches = async (
  userId: string,
  outletId: string,
  newPeriod: OfflineBusinessPeriod,
  existingOutletPeriods: OfflineBusinessPeriod[]
) => {
  const scopedNext = [newPeriod, ...existingOutletPeriods.filter((period) => period.id !== newPeriod.id)];
  await storeData('business_periods', scopedNext, userId, outletId);

  const unscoped = await getData<OfflineBusinessPeriod[] | OfflineBusinessPeriod>('business_periods', userId);
  const unscopedList = normalizeOfflinePeriods(unscoped?.data);
  const unscopedNext = [newPeriod, ...unscopedList.filter((period) => period.id !== newPeriod.id)];
  await storeData('business_periods', unscopedNext, userId);
};

export const useAutoStartPeriod = (outletId?: string) => {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();

  useEffect(() => {
    if (!user || !outletId) return;

    // Fonction pour vérifier et démarrer une période si nécessaire
    const checkAndStartPeriod = async () => {
      try {
        if (isOffline) {
          const periods = await getOfflinePeriodsForOutlet(user.id, outletId);
          const activePeriod = periods.find((period) => !period.ended_at);

          if (!activePeriod) {
            const newId = generateLocalId();
            const now = new Date().toISOString();
            const newPeriod: OfflineBusinessPeriod = {
              id: newId,
              user_id: user.id,
              outlet_id: outletId,
              started_at: now,
              ended_at: null,
              total_orders: 0,
              total_invoices: 0,
              paid_invoices: 0,
              unpaid_invoices: 0,
              total_revenue: 0,
              created_at: now,
              updated_at: now,
            };

            // Queue for sync
            await queueMutation({
              table: 'business_periods',
              operation: 'insert',
              data: newPeriod as unknown as Record<string, unknown>,
              localId: newId,
              userId: user.id,
              outletId,
              maxRetries: 3,
              conflictResolution: 'client-wins',
            });

            await upsertOfflinePeriodInCaches(user.id, outletId, newPeriod, periods);
            localStorage.setItem(`active_period_${user.id}_${outletId}`, newId);

            toast.success('Période d\'activité démarrée (hors ligne)', {
              description: 'Une nouvelle période a été créée localement.',
            });
          }
          return;
        }

        // Online: check Supabase
        const { data: activePeriod } = await supabase
          .from('business_periods')
          .select('id')
          .eq('user_id', user.id)
          .eq('outlet_id', outletId)
          .is('ended_at', null)
          .maybeSingle();

        if (!activePeriod) {
          const { data: newPeriod, error } = await supabase
            .from('business_periods')
            .insert({
              user_id: user.id,
              outlet_id: outletId,
              started_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          if (newPeriod) {
            localStorage.setItem(`active_period_${user.id}_${outletId}`, newPeriod.id);
            toast.success('Période d\'activité démarrée automatiquement', {
              description: 'Une nouvelle période a été créée pour enregistrer cette transaction.',
            });
          }
        }
      } catch (error) {
        console.error('Error auto-starting period:', error);
      }
    };

    if (isOffline) {
      // In offline mode, no realtime channels — period will be auto-started
      // when a payment happens via the mutation hooks calling this directly.
      return;
    }

    // Online: listen for realtime events
    const invoiceChannel = supabase
      .channel(`auto-start-period-invoices-${user.id}-${outletId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'invoices', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'paid') {
            await checkAndStartPeriod();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'invoices', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'paid' && payload.old?.status !== 'paid') {
            await checkAndStartPeriod();
          }
        }
      )
      .subscribe();

    const transactionChannel = supabase
      .channel(`auto-start-period-transactions-${user.id}-${outletId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'completed') {
            await checkAndStartPeriod();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'completed' && payload.old?.status !== 'completed') {
            await checkAndStartPeriod();
          }
        }
      )
      .subscribe();

    const orderChannel = supabase
      .channel(`auto-start-period-orders-${user.id}-${outletId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.new?.outlet_id === outletId) {
            await checkAndStartPeriod();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invoiceChannel);
      supabase.removeChannel(transactionChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [user, outletId, isOffline]);
};

/**
 * Exported for direct calls from offline mutation hooks (e.g. markSessionAsPaid).
 * Checks if a period exists in IndexedDB and creates one if not.
 */
export const ensurePeriodExistsOffline = async (userId: string, outletId?: string) => {
  if (!userId || !outletId) return;

  try {
    const periods = await getOfflinePeriodsForOutlet(userId, outletId);
    const activePeriod = periods.find((period) => !period.ended_at);

    if (!activePeriod) {
      const newId = generateLocalId();
      const now = new Date().toISOString();
      const newPeriod: OfflineBusinessPeriod = {
        id: newId,
        user_id: userId,
        outlet_id: outletId,
        started_at: now,
        ended_at: null,
        total_orders: 0,
        total_invoices: 0,
        paid_invoices: 0,
        unpaid_invoices: 0,
        total_revenue: 0,
        created_at: now,
        updated_at: now,
      };

      await queueMutation({
        table: 'business_periods',
        operation: 'insert',
        data: newPeriod as unknown as Record<string, unknown>,
        localId: newId,
        userId,
        outletId,
        maxRetries: 3,
        conflictResolution: 'client-wins',
      });

      await upsertOfflinePeriodInCaches(userId, outletId, newPeriod, periods);
      localStorage.setItem(`active_period_${userId}_${outletId}`, newId);
    }
  } catch (error) {
    console.error('Error ensuring offline period:', error);
  }
};
