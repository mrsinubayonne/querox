import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutlets } from './useOutlets';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalDishes: number;
  totalCustomers: number;
  paidInvoices: number;
  unpaidInvoices: number;
  averageOrderValue: number;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const { selectedOutletId } = useOutlets();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalDishes: 0,
    totalCustomers: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Fetch today's orders
      const ordersQuery = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayISO);

      if (selectedOutletId) {
        ordersQuery.eq('outlet_id', selectedOutletId);
      }

      const { data: orders } = await ordersQuery;

      // Fetch today's invoices
      const invoicesQuery = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayISO);

      if (selectedOutletId) {
        invoicesQuery.eq('outlet_id', selectedOutletId);
      }

      const { data: invoices } = await invoicesQuery;

      // Calculate stats
      const orderRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
      const invoiceRevenue = invoices
        ?.filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

      const totalRevenue = orderRevenue + invoiceRevenue;
      const totalOrders = orders?.length || 0;

      // Count total dishes sold
      const totalDishes = orders?.reduce((sum, order) => {
        const items = order.items as any[];
        return sum + (items?.length || 0);
      }, 0) || 0;

      // Count unique customers
      const uniqueCustomers = new Set(
        orders?.map(order => order.customer_email || order.customer_name).filter(Boolean) || []
      ).size;

      const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
      const unpaidInvoices = invoices?.filter(inv => inv.status === 'unpaid').length || 0;

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalRevenue,
        totalOrders,
        totalDishes,
        totalCustomers: uniqueCustomers,
        paidInvoices,
        unpaidInvoices,
        averageOrderValue,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time updates
    const ordersChannel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchStats()
      )
      .subscribe();

    const invoicesChannel = supabase
      .channel('dashboard-invoices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [user, selectedOutletId]);

  return { stats, loading, refetch: fetchStats };
};
