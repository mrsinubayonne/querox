import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminRevenue } from '@/hooks/useAdminRevenue';
import ModernStatCard from '@/components/ModernStatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import ChurnRateCard from '@/components/admin/ChurnRateCard';
import PeriodSelector from '@/components/admin/PeriodSelector';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  Activity,
  Percent,
  Building2,
  Award
} from 'lucide-react';
import { useState } from 'react';

const BusinessMetricsPanel: React.FC = () => {
  const {
    revenueStats,
    churnData,
    restaurantRevenue,
    subscribersByPlan,
    loading,
    processDataByPeriod,
    getActiveRestaurants,
    getGrowthRate
  } = useAdminRevenue();

  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const activeRestaurants = getActiveRestaurants();
  const growthRate = getGrowthRate();
  const totalRevenue = revenueStats.reduce((acc, stat) => acc + Number(stat.monthly_revenue || 0), 0);
  const currentMonthRevenue = Number(revenueStats[0]?.monthly_revenue || 0);
  
  // Calculate MRR (Monthly Recurring Revenue) - current month
  const mrr = currentMonthRevenue;
  
  // Calculate ARR (Annual Recurring Revenue) - MRR * 12
  const arr = mrr * 12;
  
  // Calculate ARPU (Average Revenue Per User)
  const arpu = activeRestaurants > 0 ? currentMonthRevenue / activeRestaurants : 0;
  
  // Calculate Churn Rate (from latest churn data)
  const latestChurn = churnData[0];
  const churnRate = latestChurn?.churn_rate || 0;

  // Calculate GMV (Gross Merchandise Volume) - total restaurant revenue
  const gmv = restaurantRevenue?.combined_revenue || 0;

  // Calculate activation rate (restaurants with orders vs total)
  const activationRate = activeRestaurants > 0 ? 
    ((restaurantRevenue?.total_restaurants || 0) / activeRestaurants) * 100 : 0;

  const chartData = processDataByPeriod(selectedPeriod);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="MRR (Revenu Mensuel Récurrent)"
          value={new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(mrr) + ' FCFA'}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          change={{
            value: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
            label: "vs mois dernier",
            isPositive: growthRate > 0
          }}
        />
        
        <ModernStatCard
          title="ARR (Revenu Annuel Récurrent)"
          value={new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(arr) + ' FCFA'}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />

        <ModernStatCard
          title="GMV (Volume Total Transactions)"
          value={new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(gmv) + ' FCFA'}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />

        <ModernStatCard
          title="ARPU (Revenu Moyen par Restaurant)"
          value={new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(arpu) + ' FCFA'}
          icon={<Target className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="Restaurants Actifs"
          value={activeRestaurants}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
        />

        <ModernStatCard
          title="Taux de Croissance (MoM)"
          value={`${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color={growthRate > 0 ? 'green' : 'orange'}
        />

        <ModernStatCard
          title="Taux de Churn Mensuel"
          value={`${churnRate.toFixed(1)}%`}
          icon={<Percent className="w-6 h-6" />}
          color="orange"
        />

        <ModernStatCard
          title="Taux d'Activation"
          value={`${activationRate.toFixed(1)}%`}
          icon={<Award className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Évolution des revenus</h3>
            <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
          <RevenueChart data={chartData} period={selectedPeriod} />
        </div>
        
        <div>
          <ChurnRateCard data={churnData} period={selectedPeriod} />
        </div>
      </div>

      {/* Subscribers by Plan */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Répartition par Plan d'Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Starter</span>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-500/20 text-blue-600 rounded">35k FCFA</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{subscribersByPlan.starter}</div>
              <p className="text-xs text-muted-foreground mt-1">abonnés actifs</p>
            </div>

            <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Premium</span>
                <span className="text-xs font-semibold px-2 py-1 bg-purple-500/20 text-purple-600 rounded">65k FCFA</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{subscribersByPlan.premium}</div>
              <p className="text-xs text-muted-foreground mt-1">abonnés actifs</p>
            </div>

            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Pro / Entreprise</span>
                <span className="text-xs font-semibold px-2 py-1 bg-amber-500/20 text-amber-600 rounded">91k FCFA</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{subscribersByPlan.pro}</div>
              <p className="text-xs text-muted-foreground mt-1">abonnés actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessMetricsPanel;
