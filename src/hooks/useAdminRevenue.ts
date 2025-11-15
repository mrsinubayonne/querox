
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RevenueStats {
  month: string;
  new_subscribers: number;
  active_subscribers: number;
  monthly_revenue: number;
  churned_subscribers: number;
}

interface RestaurantRevenueData {
  total_orders_revenue: number;
  total_invoices_revenue: number;
  combined_revenue: number;
  total_restaurants: number;
}

interface ChurnRateData {
  period_start: string;
  period_end: string;
  active_start: number;
  churned: number;
  churn_rate: number;
}

export const useAdminRevenue = () => {
  const [revenueStats, setRevenueStats] = useState<RevenueStats[]>([]);
  const [churnData, setChurnData] = useState<ChurnRateData[]>([]);
  const [restaurantRevenue, setRestaurantRevenue] = useState<RestaurantRevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRevenueStats = async () => {
    try {
      console.log('📊 Récupération des statistiques de revenus sécurisées...');
      
      // Use the new subscription revenue function with FCFA prices
      const { data, error } = await supabase
        .rpc('get_subscription_revenue_stats');

      if (error) {
        console.error('❌ Erreur lors de la récupération des statistiques:', error);
        if (error.message.includes('permission denied') || error.message.includes('access denied')) {
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les permissions d'accéder aux statistiques de revenus",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      console.log('✅ Statistiques de revenus récupérées:', data);
      setRevenueStats(data || []);
    } catch (error: any) {
      console.error('💥 Erreur dans fetchRevenueStats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de revenus",
        variant: "destructive",
      });
    }
  };

  const fetchChurnRate = async (periodMonths: number = 6) => {
    try {
      console.log('📈 Calcul du taux d\'attrition...');
      
      const { data, error } = await supabase
        .rpc('calculate_churn_rate', { period_months: periodMonths });

      if (error) {
        console.error('❌ Erreur lors du calcul du churn rate:', error);
        if (error.message.includes('permission denied') || error.message.includes('access denied')) {
          toast({
            title: "Accès refusé", 
            description: "Vous n'avez pas les permissions d'accéder aux données d'attrition",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      console.log('✅ Taux d\'attrition calculé:', data);
      setChurnData(data || []);
    } catch (error: any) {
      console.error('💥 Erreur dans fetchChurnRate:', error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer le taux d'attrition",
        variant: "destructive",
      });
    }
  };

  const fetchRestaurantRevenue = async () => {
    try {
      console.log('💰 Récupération du CA des restaurants...');
      
      const { data, error } = await supabase
        .rpc('get_restaurants_total_revenue');

      if (error) {
        console.error('❌ Erreur lors de la récupération du CA des restaurants:', error);
        throw error;
      }

      console.log('✅ CA des restaurants récupéré:', data);
      if (data && data.length > 0) {
        setRestaurantRevenue(data[0]);
      }
    } catch (error: any) {
      console.error('💥 Erreur dans fetchRestaurantRevenue:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le CA des restaurants",
        variant: "destructive",
      });
    }
  };

  const processDataByPeriod = (period: 'monthly' | 'quarterly' | 'yearly') => {
    if (period === 'monthly') {
      return revenueStats.map(stat => ({
        month: stat.month,
        revenue: Number(stat.monthly_revenue || 0),
        subscribers: stat.active_subscribers
      }));
    }
    
    if (period === 'quarterly') {
      const quarterlyData: { [key: string]: { revenue: number; subscribers: number } } = {};
      
      revenueStats.forEach(stat => {
        const date = new Date(stat.month);
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const key = `${year}-Q${quarter}`;
        
        if (!quarterlyData[key]) {
          quarterlyData[key] = { revenue: 0, subscribers: 0 };
        }
        
        quarterlyData[key].revenue += Number(stat.monthly_revenue || 0);
        quarterlyData[key].subscribers = Math.max(quarterlyData[key].subscribers, stat.active_subscribers);
      });
      
      return Object.entries(quarterlyData).map(([key, data]) => ({
        month: key,
        revenue: data.revenue,
        subscribers: data.subscribers
      }));
    }
    
    if (period === 'yearly') {
      const yearlyData: { [key: string]: { revenue: number; subscribers: number } } = {};
      
      revenueStats.forEach(stat => {
        const year = new Date(stat.month).getFullYear().toString();
        
        if (!yearlyData[year]) {
          yearlyData[year] = { revenue: 0, subscribers: 0 };
        }
        
        yearlyData[year].revenue += Number(stat.monthly_revenue || 0);
        yearlyData[year].subscribers = Math.max(yearlyData[year].subscribers, stat.active_subscribers);
      });
      
      return Object.entries(yearlyData).map(([year, data]) => ({
        month: year,
        revenue: data.revenue,
        subscribers: data.subscribers
      }));
    }
    
    return [];
  };

  const getTotalRevenue = () => {
    return revenueStats.reduce((sum, stat) => sum + Number(stat.monthly_revenue || 0), 0);
  };

  const getActiveRestaurants = () => {
    const latest = revenueStats[0];
    return latest ? latest.active_subscribers : 0;
  };

  const getGrowthRate = () => {
    if (revenueStats.length < 2) return 0;
    
    const current = Number(revenueStats[0]?.monthly_revenue || 0);
    const previous = Number(revenueStats[1]?.monthly_revenue || 0);
    
    if (previous === 0) return 0;
    
    return ((current - previous) / previous) * 100;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRevenueStats(),
        fetchChurnRate(6)
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    revenueStats,
    churnData,
    restaurantRevenue,
    loading,
    processDataByPeriod,
    getTotalRevenue,
    getActiveRestaurants,
    getGrowthRate,
    refetch: () => {
      fetchRevenueStats();
      fetchChurnRate(6);
      fetchRestaurantRevenue();
    }
  };
};
