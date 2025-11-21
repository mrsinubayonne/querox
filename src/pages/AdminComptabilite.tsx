import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Receipt, Calendar, Users, Target, Activity, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AccountingCalculator } from '@/components/admin/AccountingCalculator';
import { ManualAccountingEntries } from '@/components/admin/ManualAccountingEntries';

interface FinancialStats {
  totalSubscriptionRevenue: number;
  monthlyRevenue: number;
  activeSubscribers: number;
  starterCount: number;
  premiumCount: number;
  proCount: number;
  trialingCount: number;
  cancelledCount: number;
  arr: number;
  mrr: number;
  arpu: number;
  churnRate: number;
  conversionRate: number;
  ltv: number;
  growthRate: number;
}

interface SubscriptionTransaction {
  id: string;
  email: string;
  tier: string;
  status: string;
  amount: number;
  date: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
  newSubscribers: number;
  churnedSubscribers: number;
  activeSubscribers: number;
}

interface TierDistribution {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

const AdminComptabilite: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats>({
    totalSubscriptionRevenue: 0,
    monthlyRevenue: 0,
    activeSubscribers: 0,
    starterCount: 0,
    premiumCount: 0,
    proCount: 0,
    trialingCount: 0,
    cancelledCount: 0,
    arr: 0,
    mrr: 0,
    arpu: 0,
    churnRate: 0,
    conversionRate: 0,
    ltv: 0,
    growthRate: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<SubscriptionTransaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [tierDistribution, setTierDistribution] = useState<TierDistribution[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchFinancialData();
    }
  }, [isAdmin]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all subscribers
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('id, email, subscription_tier, subscription_status, subscription_start, subscription_end, updated_at, created_at')
        .order('updated_at', { ascending: false });

      if (!subscribers) {
        toast.error('Erreur lors du chargement des abonnements');
        return;
      }

      const prices = { starter: 35000, premium: 65000, pro: 91000 };

      // Basic counts
      const activeSubscribers = subscribers.filter(s => s.subscription_status === 'active').length;
      const starterCount = subscribers.filter(s => s.subscription_tier === 'starter' && s.subscription_status === 'active').length;
      const premiumCount = subscribers.filter(s => s.subscription_tier === 'premium' && s.subscription_status === 'active').length;
      const proCount = subscribers.filter(s => s.subscription_tier === 'pro' && s.subscription_status === 'active').length;
      const trialingCount = subscribers.filter(s => s.subscription_status === 'trialing').length;
      const cancelledCount = subscribers.filter(s => s.subscription_status === 'cancelled').length;

      // MRR (Monthly Recurring Revenue)
      const mrr = subscribers.reduce((sum, s) => {
        if (s.subscription_status === 'active') {
          return sum + (prices[s.subscription_tier as keyof typeof prices] || 0);
        }
        return sum;
      }, 0);

      // ARR (Annual Recurring Revenue)
      const arr = mrr * 12;

      // ARPU (Average Revenue Per User)
      const arpu = activeSubscribers > 0 ? mrr / activeSubscribers : 0;

      // Monthly revenue (new subscriptions this month)
      const monthlyRevenue = subscribers
        .filter(s => {
          const date = new Date(s.subscription_start || s.created_at);
          return date >= firstDayOfMonth && s.subscription_status === 'active';
        })
        .reduce((sum, s) => sum + (prices[s.subscription_tier as keyof typeof prices] || 0), 0);

      // Last month active subscribers
      const lastMonthActive = subscribers.filter(s => {
        const subStart = new Date(s.subscription_start || s.created_at);
        return subStart <= lastMonthEnd && (s.subscription_status === 'active' || s.subscription_status === 'cancelled');
      }).length;

      // Churn Rate
      const churnedThisMonth = subscribers.filter(s => {
        if (s.subscription_status !== 'cancelled') return false;
        const cancelDate = new Date(s.updated_at);
        return cancelDate >= firstDayOfMonth;
      }).length;
      const churnRate = lastMonthActive > 0 ? (churnedThisMonth / lastMonthActive) * 100 : 0;

      // Conversion Rate (trial to active)
      const totalTrials = subscribers.filter(s => s.subscription_status === 'trialing' || s.subscription_status === 'active').length;
      const convertedTrials = subscribers.filter(s => s.subscription_status === 'active').length;
      const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials) * 100 : 0;

      // LTV (Lifetime Value) - Simple calculation: ARPU / Churn Rate
      const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 24;

      // Growth Rate
      const lastMonthMRR = subscribers
        .filter(s => {
          const subStart = new Date(s.subscription_start || s.created_at);
          return subStart <= lastMonthEnd && s.subscription_status === 'active';
        })
        .reduce((sum, s) => sum + (prices[s.subscription_tier as keyof typeof prices] || 0), 0);
      const growthRate = lastMonthMRR > 0 ? ((mrr - lastMonthMRR) / lastMonthMRR) * 100 : 0;

      // Monthly data for charts (last 6 months)
      const monthlyChartData: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthSubscribers = subscribers.filter(s => {
          const subStart = new Date(s.subscription_start || s.created_at);
          return subStart <= monthEnd && (s.subscription_status === 'active' || (s.subscription_status === 'cancelled' && new Date(s.updated_at) > monthEnd));
        });

        const newSubs = subscribers.filter(s => {
          const subStart = new Date(s.subscription_start || s.created_at);
          return subStart >= monthStart && subStart <= monthEnd;
        }).length;

        const churnedSubs = subscribers.filter(s => {
          if (s.subscription_status !== 'cancelled') return false;
          const cancelDate = new Date(s.updated_at);
          return cancelDate >= monthStart && cancelDate <= monthEnd;
        }).length;

        const revenue = monthSubscribers.reduce((sum, s) => {
          if (s.subscription_status === 'active' || (s.subscription_status === 'cancelled' && new Date(s.updated_at) > monthEnd)) {
            return sum + (prices[s.subscription_tier as keyof typeof prices] || 0);
          }
          return sum;
        }, 0);

        monthlyChartData.push({
          month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          revenue,
          newSubscribers: newSubs,
          churnedSubscribers: churnedSubs,
          activeSubscribers: monthSubscribers.length
        });
      }

      // Tier distribution
      const tierDist: TierDistribution[] = [
        {
          name: 'Starter',
          value: starterCount,
          revenue: starterCount * 35000,
          color: '#3B82F6'
        },
        {
          name: 'Premium',
          value: premiumCount,
          revenue: premiumCount * 65000,
          color: '#8B5CF6'
        },
        {
          name: 'Pro',
          value: proCount,
          revenue: proCount * 91000,
          color: '#10B981'
        }
      ];

      // Recent subscription transactions
      const transactions: SubscriptionTransaction[] = subscribers
        .slice(0, 20)
        .map(s => ({
          id: s.id,
          email: s.email,
          tier: s.subscription_tier || 'N/A',
          status: s.subscription_status || 'unknown',
          amount: s.subscription_status === 'active' ? (prices[s.subscription_tier as keyof typeof prices] || 0) : 0,
          date: s.updated_at
        }));

      setStats({
        totalSubscriptionRevenue: mrr,
        monthlyRevenue,
        activeSubscribers,
        starterCount,
        premiumCount,
        proCount,
        trialingCount,
        cancelledCount,
        arr,
        mrr,
        arpu,
        churnRate,
        conversionRate,
        ltv,
        growthRate
      });

      setRecentTransactions(transactions);
      setMonthlyData(monthlyChartData);
      setTierDistribution(tierDist);

    } catch (error: any) {
      toast.error('Erreur lors du chargement des données financières');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 space-y-6 max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comptabilité Querox</h1>
              <p className="text-sm text-muted-foreground">Revenus des abonnements et gestion financière de la plateforme</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">MRR</span>
                  <DollarSign className="w-5 h-5 opacity-90" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.mrr.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {stats.growthRate >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-90">
                    {Math.abs(stats.growthRate).toFixed(1)}% vs mois dernier
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">ARR</span>
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">
                  {(stats.arr / 1000000).toFixed(1)}M FCFA
                </div>
                <p className="text-xs text-muted-foreground mt-1">Revenu annuel récurrent</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Abonnés Actifs</span>
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.activeSubscribers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.trialingCount} en essai gratuit</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">ARPU</span>
                  <Activity className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.arpu.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA
                </div>
                <p className="text-xs text-muted-foreground mt-1">Revenu moyen par utilisateur</p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Taux de Conversion</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.conversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Essais → Payants</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Taux de Churn</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {stats.churnRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.cancelledCount} annulations</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">LTV</span>
                  <DollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {(stats.ltv / 1000).toFixed(0)}K FCFA
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valeur vie client</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Nouveaux (ce mois)</span>
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.monthlyRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA
                </div>
                <p className="text-xs text-muted-foreground mt-1">Nouveaux abonnements</p>
              </CardContent>
            </Card>
          </div>

          {/* Calculator & Manual Entries */}
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="calculator">Calculateur</TabsTrigger>
              <TabsTrigger value="manual">Entrées Manuelles</TabsTrigger>
              <TabsTrigger value="revenue">Évolution</TabsTrigger>
              <TabsTrigger value="subscribers">Abonnés</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-4">
              <AccountingCalculator />
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <ManualAccountingEntries />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Évolution des Revenus (6 derniers mois)</CardTitle>
                  <CardDescription>MRR mensuel et tendance de croissance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                      <Tooltip 
                        formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscribers" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Croissance des Abonnés</CardTitle>
                  <CardDescription>Nouveaux abonnés vs désabonnements</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="newSubscribers" fill="#10B981" name="Nouveaux" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="churnedSubscribers" fill="#EF4444" name="Désabonnés" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Distribution Charts */}
          <Tabs defaultValue="distribution" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="distribution">Plans</TabsTrigger>
              <TabsTrigger value="revenue-dist">Revenus</TabsTrigger>
            </TabsList>

            <TabsContent value="distribution" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Répartition par Plan</CardTitle>
                  <CardDescription>Nombre d'abonnés par tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={tierDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tierDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue-dist" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenus par Plan</CardTitle>
                  <CardDescription>Distribution du MRR</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tierDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                      <Tooltip 
                        formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                        {tierDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Subscription Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Starter</span>
                  <Badge variant="outline">35 000 FCFA/mois</Badge>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.starterCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.starterCount * 35000).toLocaleString('fr-FR')} FCFA/mois
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Premium</span>
                  <Badge variant="outline">65 000 FCFA/mois</Badge>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.premiumCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.premiumCount * 65000).toLocaleString('fr-FR')} FCFA/mois
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Pro</span>
                  <Badge variant="outline">91 000 FCFA/mois</Badge>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.proCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.proCount * 91000).toLocaleString('fr-FR')} FCFA/mois
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Subscription Transactions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Abonnements Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun abonnement récent</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.status === 'active' ? 'bg-green-500' : 
                          transaction.status === 'trialing' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="font-semibold">{transaction.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {transaction.tier}
                            </Badge>
                            <Badge 
                              variant={transaction.status === 'active' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {transaction.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {transaction.amount > 0 ? `${transaction.amount.toLocaleString('fr-FR')} FCFA` : 'Essai gratuit'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminComptabilite;
