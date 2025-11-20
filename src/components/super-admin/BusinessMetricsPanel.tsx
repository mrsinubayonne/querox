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
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              growthRate > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">MRR (Revenu Mensuel Récurrent)</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(mrr)} FCFA
            </p>
            <p className="text-xs text-slate-500">vs mois dernier</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">ARR (Revenu Annuel Récurrent)</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(arr)} FCFA
            </p>
            <p className="text-xs text-slate-500">Projection annuelle</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">GMV (Volume Total Transactions)</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(gmv)} FCFA
            </p>
            <p className="text-xs text-slate-500">Toutes transactions</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">ARPU (Revenu Moyen par Restaurant)</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(arpu)} FCFA
            </p>
            <p className="text-xs text-slate-500">Par restaurant</p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-slate-400">Restaurants Actifs</p>
          </div>
          <p className="text-3xl font-bold text-white">{activeRestaurants}</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-slate-400">Croissance MoM</p>
          </div>
          <p className="text-3xl font-bold text-white">{growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Percent className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-sm text-slate-400">Taux de Churn</p>
          </div>
          <p className="text-3xl font-bold text-white">{churnRate.toFixed(1)}%</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-slate-400">Taux d'Activation</p>
          </div>
          <p className="text-3xl font-bold text-white">{activationRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Évolution des revenus</h3>
            <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
          <RevenueChart data={chartData} period={selectedPeriod} />
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
          <ChurnRateCard data={churnData} period={selectedPeriod} />
        </div>
      </div>

      {/* Subscribers by Plan */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Répartition par Plan d'Abonnement</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Starter</span>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg">35k FCFA</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{subscribersByPlan.starter}</div>
            <p className="text-xs text-slate-500">abonnés actifs</p>
          </div>

          <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Premium</span>
              <span className="text-xs font-semibold px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg">65k FCFA</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{subscribersByPlan.premium}</div>
            <p className="text-xs text-slate-500">abonnés actifs</p>
          </div>

          <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Pro / Entreprise</span>
              <span className="text-xs font-semibold px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg">91k FCFA</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{subscribersByPlan.pro}</div>
            <p className="text-xs text-slate-500">abonnés actifs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMetricsPanel;
