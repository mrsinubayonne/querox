import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getData, storeData } from '@/lib/offlineStorage';
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
        const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
        const allPeriods = (cached?.data as BusinessPeriod[]) || [];
        
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
      const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
      const existingAll = (cached?.data as BusinessPeriod[]) || [];
      // Merge: replace closed periods for this outlet, keep others
      const otherPeriods = existingAll.filter(p => 
        p.ended_at === null || (outletId && p.outlet_id !== outletId)
      );
      const merged = [...otherPeriods, ...(data || [])];
      await storeData('business_periods', merged, user.id);
    } catch (error) {
      console.error('Error fetching periods:', error);
      // Fallback to cache on network error
      const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
      const allPeriods = (cached?.data as BusinessPeriod[]) || [];
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
        const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
        const allPeriods = (cached?.data as BusinessPeriod[]) || [];
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
        const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
        const existing = (cached?.data as BusinessPeriod[]) || [];
        const withoutThis = existing.filter(p => p.id !== activePeriod.id);
        await storeData('business_periods', [...withoutThis, activePeriod], user.id);
      } else {
        setCurrentPeriod(null);
      }
    } catch (error) {
      console.error('Error initializing period:', error);
      // Fallback to cache
      const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
      const allPeriods = (cached?.data as BusinessPeriod[]) || [];
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
    if (!user || !outletId) return;

    try {
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
      
      // Cache the new period
      const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
      const existing = (cached?.data as BusinessPeriod[]) || [];
      await storeData('business_periods', [...existing, data], user.id);
      
      toast.success('Nouvelle période démarrée');
      fetchPeriods();
    } catch (error) {
      console.error('Error starting new period:', error);
      toast.error('Erreur lors du démarrage de la période');
    }
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

      const startISO = targetPeriod.started_at;
      const endISO = new Date().toISOString();

      let ordersQuery = supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
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
      const cached = await getData<BusinessPeriod[]>('business_periods', user.id);
      const existing = (cached?.data as BusinessPeriod[]) || [];
      const updated = existing.map(p => p.id === closedPeriod.id ? closedPeriod : p);
      await storeData('business_periods', updated, user.id);

      await fetchPeriods();
      toast.success('Journée bouclée avec succès');
    } catch (error) {
      console.error('Error closing period:', error);
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
