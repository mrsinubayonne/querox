import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutlets } from './useOutlets';
import { getData, storeData } from '@/lib/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';

type Period = 'day' | 'week' | 'month';

interface DashboardStats {
  // Revenue
  revenue: number;
  previousRevenue: number;
  revenueChange: number;
  
  // Orders
  totalOrders: number;
  previousOrders: number;
  ordersChange: number;
  successRate: number;
  
  // Products
  averageCart: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  
  // Alerts
  lowStockItems: Array<{ name: string; stock: number; minStock: number }>;
  delayedOrders: Array<{ id: string; customerName: string; createdAt: string }>;
}

export const useDashboardStats = (period: Period = 'day') => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { selectedOutletId } = useOutlets();
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    previousRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    previousOrders: 0,
    ordersChange: 0,
    successRate: 0,
    averageCart: 0,
    topProducts: [],
    lowStockItems: [],
    delayedOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const { isOffline } = useNetworkStatus();

  const getDateRange = (period: Period) => {
    const now = new Date();
    const start = new Date();
    const previousStart = new Date();
    const previousEnd = new Date();

    if (period === 'day') {
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setDate(start.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      previousStart.setDate(start.getDate() - 7);
      previousEnd.setDate(start.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      previousStart.setMonth(start.getMonth() - 1);
      previousStart.setDate(1);
      previousEnd.setMonth(start.getMonth());
      previousEnd.setDate(0);
      previousEnd.setHours(23, 59, 59, 999);
    }

    return {
      start: start.toISOString(),
      previousStart: previousStart.toISOString(),
      previousEnd: previousEnd.toISOString(),
    };
  };

  const fetchStats = async () => {
    const effectiveUserId = isTeamMember && teamMemberSession 
      ? teamMemberSession.ownerId 
      : user?.id;
    
    if (!effectiveUserId) return;

    if (isOffline) {
      const cached = await getData('dashboard_stats' as any, effectiveUserId);
      if (cached?.data) {
        setStats(cached.data as DashboardStats);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      const { start, previousStart, previousEnd } = getDateRange(period);

      // Build queries (LIMIT 10000 to bypass Supabase's default 1000 cap)
      let ordersQuery = supabase
        .from('orders')
        .select('*')
        .eq('user_id', effectiveUserId)
        .gte('created_at', start)
        .limit(10000);

      let previousOrdersQuery = supabase
        .from('orders')
        .select('*')
        .eq('user_id', effectiveUserId)
        .gte('created_at', previousStart)
        .lte('created_at', previousEnd)
        .limit(10000);

      let invoicesQuery = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', effectiveUserId)
        .gte('created_at', start)
        .limit(10000);

      let previousInvoicesQuery = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', effectiveUserId)
        .gte('created_at', previousStart)
        .lte('created_at', previousEnd)
        .limit(10000);

      let inventoryQuery = supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', effectiveUserId)
        .limit(10000);

      if (selectedOutletId) {
        ordersQuery = ordersQuery.eq('outlet_id', selectedOutletId);
        previousOrdersQuery = previousOrdersQuery.eq('outlet_id', selectedOutletId);
        invoicesQuery = invoicesQuery.eq('outlet_id', selectedOutletId);
        previousInvoicesQuery = previousInvoicesQuery.eq('outlet_id', selectedOutletId);
        inventoryQuery = inventoryQuery.eq('outlet_id', selectedOutletId);
      }

      const [
        { data: orders },
        { data: previousOrders },
        { data: invoices },
        { data: previousInvoices },
        { data: inventoryItems },
      ] = await Promise.all([
        ordersQuery,
        previousOrdersQuery,
        invoicesQuery,
        previousInvoicesQuery,
        inventoryQuery,
      ]);

      // Calculate revenue — ONLY from paid invoices to match accounting
      const paidInvoices =
        invoices?.filter((inv) => inv.status === 'paid') || [];

      // Deduplicate paid invoices by invoice_number (keep most recent)
      const invoiceMap = new Map<string, any>();
      for (const inv of paidInvoices) {
        const existing = invoiceMap.get(inv.invoice_number);
        if (!existing || new Date(inv.updated_at) > new Date(existing.updated_at)) {
          invoiceMap.set(inv.invoice_number, inv);
        }
      }
      const uniquePaidInvoices = Array.from(invoiceMap.values());

      const revenue = Math.round(uniquePaidInvoices.reduce(
        (sum, inv: any) => sum + Number(inv.total_amount || 0),
        0
      ));

      // Previous period revenue — same logic: only paid invoices
      const previousPaidInvoices =
        previousInvoices?.filter((inv) => inv.status === 'paid') || [];

      const prevInvoiceMap = new Map<string, any>();
      for (const inv of previousPaidInvoices) {
        const existing = prevInvoiceMap.get(inv.invoice_number);
        if (!existing || new Date(inv.updated_at) > new Date(existing.updated_at)) {
          prevInvoiceMap.set(inv.invoice_number, inv);
        }
      }
      const uniquePreviousPaidInvoices = Array.from(prevInvoiceMap.values());

      const previousRevenue = Math.round(uniquePreviousPaidInvoices.reduce(
        (sum, inv: any) => sum + Number(inv.total_amount || 0),
        0
      ));

      const revenueChange =
        previousRevenue > 0
          ? ((revenue - previousRevenue) / previousRevenue) * 100
          : 0;

      // Calculate orders
      const totalOrders = orders?.length || 0;
      const previousOrdersCount = previousOrders?.length || 0;
      const ordersChange = previousOrdersCount > 0 ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100 : 0;

      // Calculate success rate
      const successfulOrders = orders?.filter(o => o.status === 'delivered' || o.status === 'completed').length || 0;
      const successRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;

      // Calculate average cart
      const averageCart = totalOrders > 0 ? revenue / totalOrders : 0;

      // Calculate top products
      const productMap = new Map<string, { quantity: number; revenue: number }>();
      orders?.forEach(order => {
        const items = order.items as any[];
        items?.forEach(item => {
          const current = productMap.get(item.name) || { quantity: 0, revenue: 0 };
          productMap.set(item.name, {
            quantity: current.quantity + (item.quantity || 1),
            revenue: current.revenue + (item.price * (item.quantity || 1)),
          });
        });
      });

      const topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

      // Calculate alerts
      const lowStockItems = inventoryItems
        ?.filter(item => (item.current_stock || 0) <= (item.min_stock || 0))
        .map(item => ({
          name: item.name,
          stock: item.current_stock || 0,
          minStock: item.min_stock || 0,
        }))
        .slice(0, 5) || [];

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const delayedOrders = orders
        ?.filter(order => 
          order.status === 'pending' && 
          order.created_at < twoHoursAgo
        )
        .map(order => ({
          id: order.id,
          customerName: order.customer_name,
          createdAt: order.created_at,
        }))
        .slice(0, 5) || [];

      const computedStats: DashboardStats = {
        revenue,
        previousRevenue,
        revenueChange,
        totalOrders,
        previousOrders: previousOrdersCount,
        ordersChange,
        successRate,
        averageCart,
        topProducts,
        lowStockItems,
        delayedOrders,
      };
      setStats(computedStats);
      if (!isOffline) {
        await storeData('dashboard_stats' as any, computedStats, effectiveUserId);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      const cached = await getData('dashboard_stats' as any, effectiveUserId);
      if (cached?.data) {
        setStats(cached.data as DashboardStats);
      } else {
        setStats({
          revenue: 0,
          previousRevenue: 0,
          revenueChange: 0,
          totalOrders: 0,
          previousOrders: 0,
          ordersChange: 0,
          successRate: 0,
          averageCart: 0,
          topProducts: [],
          lowStockItems: [],
          delayedOrders: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const effectiveUserId = isTeamMember && teamMemberSession 
      ? teamMemberSession.ownerId 
      : user?.id;

    if (!effectiveUserId) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const debouncedFetchStats = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void fetchStats();
      }, 2000);
    };

    const ordersChannel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${effectiveUserId}`,
        },
        debouncedFetchStats
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
          filter: `user_id=eq.${effectiveUserId}`,
        },
        debouncedFetchStats
      )
      .subscribe();

    const inventoryChannel = supabase
      .channel('dashboard-inventory')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items',
          filter: `user_id=eq.${effectiveUserId}`,
        },
        debouncedFetchStats
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(inventoryChannel);
    };
  }, [user, selectedOutletId, period]);

  return { stats, loading, refetch: fetchStats };
};
