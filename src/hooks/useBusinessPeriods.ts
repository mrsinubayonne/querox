import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const [periods, setPeriods] = useState<BusinessPeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<BusinessPeriod | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && outletId) {
      initializePeriod();
      fetchPeriods();
    }
  }, [user, outletId]);

  // Écouter les changements en temps réel sur les périodes
  useEffect(() => {
    if (!user || !outletId) return;

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
          
          // Rafraîchir les données
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
  }, [user, outletId]);

  const fetchPeriods = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('business_periods')
        .select('*')
        .eq('user_id', user.id)
        .not('ended_at', 'is', null)
        .order('ended_at', { ascending: false });

      // IMPORTANT: Toujours filtrer par outlet_id si spécifié
      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPeriods(data || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
      toast.error('Erreur lors du chargement des périodes');
    }
  };

  // Initialize period: fetch active period only (no auto-creation)
  const initializePeriod = async () => {
    if (!user || !outletId) return;

    setLoading(true);
    try {
      // Try to fetch existing active period
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
        // Store period ID in localStorage for persistence with user_id
        localStorage.setItem(`active_period_${user.id}_${outletId}`, activePeriod.id);
      } else {
        setCurrentPeriod(null);
      }
    } catch (error) {
      console.error('Error initializing period:', error);
      toast.error('Erreur lors de l\'initialisation de la période');
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

      // IMPORTANT: Filtrer strictement par outlet_id
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
      // Check if there's already an open period for this outlet
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

      // Create new period
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
      // Store period ID in localStorage for persistence across disconnections with user_id
      if (outletId) {
        localStorage.setItem(`active_period_${user.id}_${outletId}`, data.id);
      }
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

      // Calculate stats for the period
      const startISO = targetPeriod.started_at;
      const endISO = new Date().toISOString();

      // Fetch orders for this period - STRICTEMENT pour ce PDV uniquement et UNIQUEMENT les commandes payées
      let ordersQuery = supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      // CRITIQUE: Toujours filtrer par outlet si présent
      if (targetPeriod.outlet_id) {
        ordersQuery = ordersQuery.eq('outlet_id', targetPeriod.outlet_id);
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      // Fetch invoices for this period - STRICTEMENT pour ce PDV uniquement
      let invoicesQuery = supabase
        .from('invoices')
        .select('id, total_amount, status')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      // CRITIQUE: Toujours filtrer par outlet si présent
      if (targetPeriod.outlet_id) {
        invoicesQuery = invoicesQuery.eq('outlet_id', targetPeriod.outlet_id);
      }

      const { data: invoices, error: invoicesError } = await invoicesQuery;
      if (invoicesError) throw invoicesError;

      // Calculate totals
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const totalInvoices = invoices?.length || 0;
      const paidInvoices = invoices?.filter((i) => i.status === 'paid').length || 0;
      const unpaidInvoices = totalInvoices - paidInvoices;

      // Update period with stats and close it
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
      // Clear localStorage when period is closed with user_id
      if (targetPeriod.outlet_id) {
        localStorage.removeItem(`active_period_${user.id}_${targetPeriod.outlet_id}`);
      }

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
