import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getData, storeData, queueMutation, generateLocalId } from '@/lib/offlineStorage';
import { toast } from 'sonner';

export interface BusinessPeriod {
  id: string;
  user_id: string;
  outlet_id: string | null;
  started_at: string;
  ended_at: string | null;
  total_orders: number;
  total_revenue: number;
  total_invoices: number;
  paid_invoices: number;
  unpaid_invoices: number;
  created_at: string;
  updated_at: string;
}

interface UseBusinessPeriodsProps {
  outletId?: string;
}

export const useBusinessPeriods = ({ outletId }: UseBusinessPeriodsProps = {}) => {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const [periods, setPeriods] = useState<BusinessPeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<BusinessPeriod | null>(null);
  const [loading, setLoading] = useState(false);

  const asPeriodsArray = (value: unknown): BusinessPeriod[] => {
    if (Array.isArray(value)) {
      return value as BusinessPeriod[];
    }

    if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
      return [value as BusinessPeriod];
    }

    return [];
  };

  const getCachedPeriods = async (targetOutletId?: string): Promise<BusinessPeriod[]> => {
    if (!user) return [];

    try {
      const scoped = targetOutletId
        ? await getData<BusinessPeriod[] | BusinessPeriod>('business_periods', user.id, targetOutletId)
        : undefined;
      const unscoped = await getData<BusinessPeriod[] | BusinessPeriod>('business_periods', user.id);

      const scopedList = asPeriodsArray(scoped?.data);
      const unscopedList = asPeriodsArray(unscoped?.data);
      const merged = [...scopedList, ...unscopedList];

      // De-duplicate by id to avoid double entries after partial cache writes
      const deduped = Array.from(new Map(merged.map((period) => [period.id, period])).values());

      return targetOutletId
        ? deduped.filter((period) => !period.outlet_id || period.outlet_id === targetOutletId)
        : deduped;
    } catch (error) {
      console.warn('[Offline] Impossible de lire le cache business_periods:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user && outletId) {
      initializePeriod();
      fetchPeriods();
    }
  }, [user, outletId, isOffline]);

  // Écouter les changements en temps réel sur les périodes
  useEffect(() => {
    if (!user || !outletId || isOffline) return;

    const channel = supabase
      .channel(`business-periods-${outletId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_periods',
          filter: `user_id=eq.${user.id},outlet_id=eq.${outletId}`
        },
        (payload) => {
          console.log('🔄 Changement détecté sur business_periods:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            fetchCurrentPeriod();
            fetchPeriods();
          } else if (payload.eventType === 'DELETE') {
            fetchPeriods();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, outletId, isOffline]);

  const fetchPeriods = async () => {
    if (!user) return;

    try {
      if (isOffline) {
        // --- MODE HORS-LIGNE : lecture depuis IndexedDB ---
        const allPeriods = await getCachedPeriods(outletId);
        
        // Filter: closed periods for this outlet, sorted desc
        const closed = allPeriods
          .filter(p => p.ended_at !== null && (!outletId || p.outlet_id === outletId))
          .sort((a, b) => (b.ended_at || '').localeCompare(a.ended_at || ''));
        
        console.log('[Offline] Périodes bouclées depuis cache:', closed.length);
        setPeriods(closed);
        return;
      }

      let query = supabase
        .from('business_periods')
        .select('*')
        .eq('user_id', user.id)
        .not('ended_at', 'is', null)
        .order('ended_at', { ascending: false });

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPeriods(data || []);
      
      // Cache for offline use
      const existingAll = await getCachedPeriods();
      // Merge: replace closed periods for this outlet, keep others
      const otherPeriods = existingAll.filter(p => 
        p.ended_at === null || (outletId && p.outlet_id !== outletId)
      );
      const merged = [...otherPeriods, ...(data || [])];
      await storeData('business_periods', merged, user.id);
    } catch (error) {
      console.error('Error fetching periods:', error);
      // Fallback to cache on network error
      const allPeriods = await getCachedPeriods();
      const closed = allPeriods
        .filter(p => p.ended_at !== null && (!outletId || p.outlet_id === outletId))
        .sort((a, b) => (b.ended_at || '').localeCompare(a.ended_at || ''));
      if (closed.length > 0) {
        console.warn('[Fallback] Using cached periods:', closed.length);
        setPeriods(closed);
      } else {
        toast.error('Erreur lors du chargement des périodes');
      }
    }
  };

  const initializePeriod = async () => {
    if (!user || !outletId) return;

    setLoading(true);
    try {
      if (isOffline) {
        // --- MODE HORS-LIGNE : chercher la période active dans le cache ---
        const allPeriods = await getCachedPeriods(outletId);
        const active = allPeriods.find(p => 
          p.ended_at === null && p.outlet_id === outletId
        );
        
        if (active) {
          setCurrentPeriod(active);
          console.log('[Offline] Période active trouvée dans le cache:', active.id);
        } else {
          setCurrentPeriod(null);
          console.log('[Offline] Aucune période active dans le cache');
        }
        return;
      }

      const { data: activePeriod, error } = await supabase
        .from('business_periods')
        .select('*')
        .eq('user_id', user.id)
        .eq('outlet_id', outletId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (activePeriod) {
        setCurrentPeriod(activePeriod);
        localStorage.setItem(`active_period_${user.id}_${outletId}`, activePeriod.id);
        
        // Cache active period
        const existing = await getCachedPeriods();
        const withoutThis = existing.filter(p => p.id !== activePeriod.id);
        await storeData('business_periods', [...withoutThis, activePeriod], user.id);
      } else {
        setCurrentPeriod(null);
      }
    } catch (error) {
      console.error('Error initializing period:', error);
      // Fallback to cache
      const allPeriods = await getCachedPeriods(outletId);
      const active = allPeriods.find(p => p.ended_at === null && p.outlet_id === outletId);
      if (active) {
        setCurrentPeriod(active);
        console.warn('[Fallback] Using cached active period');
      } else {
        toast.error("Erreur lors de l'initialisation de la période");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPeriod = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('business_periods')
        .select('*')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1);

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setCurrentPeriod(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching current period:', error);
    }
  };

  const startNewPeriod = async () => {
    if (!user || !outletId) {
      toast.error('Veuillez sélectionner un point de vente avant de démarrer une période');
      return;
    }

    const startOfflinePeriod = async (): Promise<'started' | 'already-active' | 'failed'> => {
      try {
        const scopedPeriods = await getCachedPeriods(outletId);
        const unscopedPeriods = await getCachedPeriods();

        const activePeriod =
          scopedPeriods.find((period) => period.ended_at === null && period.outlet_id === outletId) ||
          unscopedPeriods.find((period) => period.ended_at === null && period.outlet_id === outletId);

        if (activePeriod) {
          setCurrentPeriod(activePeriod);
          localStorage.setItem(`active_period_${user.id}_${outletId}`, activePeriod.id);
          toast.info('Une période est déjà en cours (hors ligne).');
          return 'already-active';
        }

        const now = new Date().toISOString();
        const localPeriod: BusinessPeriod = {
          id: generateLocalId(),
          user_id: user.id,
          outlet_id: outletId,
          started_at: now,
          ended_at: null,
          total_orders: 0,
          total_revenue: 0,
          total_invoices: 0,
          paid_invoices: 0,
          unpaid_invoices: 0,
          created_at: now,
          updated_at: now,
        };

        setCurrentPeriod(localPeriod);
        localStorage.setItem(`active_period_${user.id}_${outletId}`, localPeriod.id);

        const scopedNext = [localPeriod, ...scopedPeriods.filter((period) => period.id !== localPeriod.id)];
        const unscopedNext = [localPeriod, ...unscopedPeriods.filter((period) => period.id !== localPeriod.id)];

        const persistenceResults = await Promise.allSettled([
          queueMutation({
            table: 'business_periods',
            operation: 'insert',
            data: localPeriod as unknown as Record<string, unknown>,
            localId: localPeriod.id,
            userId: user.id,
            outletId,
            maxRetries: 3,
            conflictResolution: 'client-wins',
          }),
          storeData('business_periods', scopedNext, user.id, outletId),
          storeData('business_periods', unscopedNext, user.id),
        ]);

        const allRejected = persistenceResults.every((result) => result.status === 'rejected');
        if (allRejected) {
          console.error('[Offline] Échec complet de persistance:', persistenceResults);
          setCurrentPeriod(null);
          localStorage.removeItem(`active_period_${user.id}_${outletId}`);
          toast.error('Impossible de démarrer la période en local');
          return 'failed';
        }

        const hasPartialFailure = persistenceResults.some((result) => result.status === 'rejected');
        if (hasPartialFailure) {
          console.error('[Offline] Démarrage partiel: persistance incomplète', persistenceResults);
          toast.success('Période démarrée localement (synchronisation en attente)');
        } else {
          toast.success('Nouvelle période démarrée (hors ligne)');
        }

        return 'started';
      } catch (offlineError) {
        console.error('[Offline] Erreur au démarrage de période:', offlineError);
        toast.error('Impossible de démarrer la période hors ligne');
        return 'failed';
      }
    };

    try {
      if (isOffline || !navigator.onLine) {
        await startOfflinePeriod();
        return;
      }

      let checkQuery = supabase
        .from('business_periods')
        .select('id')
        .eq('user_id', user.id)
        .is('ended_at', null);

      if (outletId) {
        checkQuery = checkQuery.eq('outlet_id', outletId);
      }

      const { data: existingPeriods, error: checkError } = await checkQuery;
      if (checkError) throw checkError;

      if (existingPeriods && existingPeriods.length > 0) {
        toast.error('Une période est déjà en cours. Veuillez la boucler d\'abord.');
        return;
      }

      const { data, error } = await supabase
        .from('business_periods')
        .insert({
          user_id: user.id,
          outlet_id: outletId || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentPeriod(data);
      if (outletId) {
        localStorage.setItem(`active_period_${user.id}_${outletId}`, data.id);
      }

      const existing = await getCachedPeriods();
      await storeData('business_periods', [...existing, data], user.id);

      toast.success('Nouvelle période démarrée');
      fetchPeriods();
    } catch (error) {
      console.error('Error starting new period:', error);

      const errorMessage = (error as Error)?.message?.toLowerCase?.() || '';
      const shouldFallbackOffline =
        isOffline ||
        !navigator.onLine ||
        error instanceof TypeError ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('fetch');

      if (shouldFallbackOffline) {
        const fallbackResult = await startOfflinePeriod();
        if (fallbackResult !== 'failed') {
          return;
        }
      }

      toast.error('Erreur lors du démarrage de la période');
    }
  };

  const closePeriodOffline = async (targetPeriod: BusinessPeriod) => {
    const endISO = new Date().toISOString();
    const startISO = targetPeriod.started_at;
    const scopedOutlet = targetPeriod.outlet_id || outletId;

    // Read orders and invoices from IndexedDB
    const selectedOutlet = scopedOutlet || localStorage.getItem('selectedOutletId') || undefined;
    let cachedOrders = await getData<any[]>('orders', user!.id, selectedOutlet);
    if (!cachedOrders?.data) cachedOrders = await getData<any[]>('orders', user!.id);
    let cachedInvoices = await getData<any[]>('invoices', user!.id, selectedOutlet);
    if (!cachedInvoices?.data) cachedInvoices = await getData<any[]>('invoices', user!.id);

    const orders = ((cachedOrders?.data as any[]) || []).filter((o: any) => {
      if (!o.created_at) return false;
      if (o.created_at < startISO || o.created_at > endISO) return false;
      if (scopedOutlet && o.outlet_id !== scopedOutlet) return false;
      return true;
    });

    const invoices = ((cachedInvoices?.data as any[]) || []).filter((inv: any) => {
      if (!inv.created_at) return false;
      if (inv.created_at < startISO || inv.created_at > endISO) return false;
      if (scopedOutlet && inv.outlet_id !== scopedOutlet) return false;
      return true;
    });

    const totalOrders = orders.length;
    const revenueFromOrders = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
    const totalInvoices = invoices.length;
    const orderIds = new Set(orders.map((o: any) => o.id));
    const paidInvoiceList = invoices.filter(
      (i: any) => i.status === 'paid' && (!i.order_id || !orderIds.has(i.order_id))
    );
    const paidInvoices = paidInvoiceList.length;
    const unpaidInvoices = totalInvoices - paidInvoices;
    const revenueFromPaidInvoices = paidInvoiceList.reduce((sum: number, i: any) => sum + Number(i.total_amount || 0), 0);
    const totalRevenue = revenueFromOrders + revenueFromPaidInvoices;

    const closedPeriod: BusinessPeriod = {
      ...targetPeriod,
      ended_at: endISO,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_invoices: totalInvoices,
      paid_invoices: paidInvoices,
      unpaid_invoices: unpaidInvoices,
      updated_at: endISO,
    };

    // Update state immediately
    setCurrentPeriod(null);
    if (targetPeriod.outlet_id) {
      localStorage.removeItem(`active_period_${user!.id}_${targetPeriod.outlet_id}`);
    }

    // Persist: queue mutation + update caches
    await Promise.allSettled([
      queueMutation({
        table: 'business_periods',
        operation: 'update',
        data: {
          id: targetPeriod.id,
          ended_at: endISO,
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          total_invoices: totalInvoices,
          paid_invoices: paidInvoices,
          unpaid_invoices: unpaidInvoices,
          updated_at: endISO,
        } as unknown as Record<string, unknown>,
        localId: generateLocalId(),
        userId: user!.id,
        outletId: scopedOutlet || undefined,
        maxRetries: 3,
        conflictResolution: 'client-wins',
      }),
      (async () => {
        const scopedPeriods = await getCachedPeriods(scopedOutlet || undefined);
        const updatedScoped = scopedPeriods.map(p => p.id === closedPeriod.id ? closedPeriod : p);
        if (!updatedScoped.find(p => p.id === closedPeriod.id)) updatedScoped.push(closedPeriod);
        await storeData('business_periods', updatedScoped, user!.id, scopedOutlet || undefined);
      })(),
      (async () => {
        const unscopedPeriods = await getCachedPeriods();
        const updatedUnscoped = unscopedPeriods.map(p => p.id === closedPeriod.id ? closedPeriod : p);
        if (!updatedUnscoped.find(p => p.id === closedPeriod.id)) updatedUnscoped.push(closedPeriod);
        await storeData('business_periods', updatedUnscoped, user!.id);
      })(),
    ]);

    // Refresh the periods list from cache
    const allPeriods = await getCachedPeriods(outletId);
    const closed = allPeriods
      .filter(p => p.ended_at !== null && (!outletId || p.outlet_id === outletId))
      .sort((a, b) => (b.ended_at || '').localeCompare(a.ended_at || ''));
    setPeriods(closed);

    toast.success('Journée bouclée avec succès (hors ligne)');
  };

  const closePeriod = async (periodId?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const targetPeriod = periodId
        ? periods.find((p) => p.id === periodId) || currentPeriod
        : currentPeriod;

      if (!targetPeriod) {
        toast.error('Aucune période active à boucler');
        return;
      }

      // OFFLINE BRANCH
      if (isOffline || !navigator.onLine) {
        await closePeriodOffline(targetPeriod);
        return;
      }

      const startISO = targetPeriod.started_at;
      const endISO = new Date().toISOString();

      let ordersQuery = supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (targetPeriod.outlet_id) {
        ordersQuery = ordersQuery.eq('outlet_id', targetPeriod.outlet_id);
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      let invoicesQuery = supabase
        .from('invoices')
        .select('id, total_amount, status, order_id')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (targetPeriod.outlet_id) {
        invoicesQuery = invoicesQuery.eq('outlet_id', targetPeriod.outlet_id);
      }

      const { data: invoices, error: invoicesError } = await invoicesQuery;
      if (invoicesError) throw invoicesError;

      const totalOrders = orders?.length || 0;
      const revenueFromOrders =
        orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      const totalInvoices = invoices?.length || 0;

      const orderIds = new Set((orders || []).map((o: any) => o.id));
      const paidInvoiceList =
        invoices?.filter(
          (i) => i.status === 'paid' && (!i.order_id || !orderIds.has(i.order_id))
        ) || [];
      const paidInvoices = paidInvoiceList.length;
      const unpaidInvoices = totalInvoices - paidInvoices;

      const revenueFromPaidInvoices =
        paidInvoiceList.reduce((sum, i) => sum + Number(i.total_amount), 0) || 0;

      const totalRevenue = revenueFromOrders + revenueFromPaidInvoices;

      const { error: updateError } = await supabase
        .from('business_periods')
        .update({
          ended_at: endISO,
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          total_invoices: totalInvoices,
          paid_invoices: paidInvoices,
          unpaid_invoices: unpaidInvoices,
        })
        .eq('id', targetPeriod.id);

      if (updateError) throw updateError;

      setCurrentPeriod(null);
      if (targetPeriod.outlet_id) {
        localStorage.removeItem(`active_period_${user.id}_${targetPeriod.outlet_id}`);
      }

      // Update cache with closed period
      const closedPeriod = {
        ...targetPeriod,
        ended_at: endISO,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        total_invoices: totalInvoices,
        paid_invoices: paidInvoices,
        unpaid_invoices: unpaidInvoices,
      };
      const existing = await getCachedPeriods();
      const updated = existing.map(p => p.id === closedPeriod.id ? closedPeriod : p);
      await storeData('business_periods', updated, user.id);

      await fetchPeriods();
      toast.success('Journée bouclée avec succès');
    } catch (error) {
      console.error('Error closing period:', error);

      // Fallback to offline close if network error
      const errorMessage = (error as Error)?.message?.toLowerCase?.() || '';
      const shouldFallback = !navigator.onLine || error instanceof TypeError ||
        errorMessage.includes('failed to fetch') || errorMessage.includes('network');

      if (shouldFallback) {
        const targetPeriod = periodId
          ? periods.find((p) => p.id === periodId) || currentPeriod
          : currentPeriod;
        if (targetPeriod) {
          await closePeriodOffline(targetPeriod);
          return;
        }
      }

      toast.error('Erreur lors du bouclage de la journée');
    } finally {
      setLoading(false);
    }
  };

  return {
    periods,
    currentPeriod,
    loading,
    startNewPeriod,
    closePeriod,
    refetch: () => {
      if (outletId) {
        initializePeriod();
      }
      fetchPeriods();
    },
  };
};
