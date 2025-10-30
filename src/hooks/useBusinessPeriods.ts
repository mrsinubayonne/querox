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
    if (user) {
      fetchPeriods();
      fetchCurrentPeriod();
    }
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
    if (!user) return;

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
      toast.success('Nouvelle période démarrée');
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

      // Fetch orders for this period
      let ordersQuery = supabase
        .from('orders')
        .select('id, total_amount')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (targetPeriod.outlet_id) {
        ordersQuery = ordersQuery.eq('outlet_id', targetPeriod.outlet_id);
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      // Fetch invoices for this period
      let invoicesQuery = supabase
        .from('invoices')
        .select('id, total_amount, status')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

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

      await fetchPeriods();
      await fetchCurrentPeriod();
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
      fetchPeriods();
      fetchCurrentPeriod();
    },
  };
};
