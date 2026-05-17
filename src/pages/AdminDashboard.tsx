import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRevenue } from '@/hooks/useAdminRevenue';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import ModernStatCard from '@/components/ModernStatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import ChurnRateCard from '@/components/admin/ChurnRateCard';
import PeriodSelector from '@/components/admin/PeriodSelector';
import { RevenueProjectionCalculator } from '@/components/admin/RevenueProjectionCalculator';
import { 
  DollarSign, 
  Users, 
  ChefHat, 
  ShoppingCart, 
  CreditCard,
  TrendingUp,
  Building2,
  Target
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDishes: number;
  totalOrders: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDishes: 0,
    totalOrders: 0
  });
  const {
    revenueStats,
    churnData,
    restaurantRevenue,
    subscribersByPlan,
    loading: revenueLoading,
    processDataByPeriod,
    getActiveRestaurants,
    getGrowthRate
  } = useAdminRevenue();

  // Tout à zéro - ne compte que les nouveaux abonnements à partir de maintenant
  const totalRevenueSinceBeginning = 0;
  const currentMonthRevenue = 0;
  const activeRestaurants = 0;
  const growthRate = 0;

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: dishesCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalDishes: dishesCount || 0,
        totalOrders: ordersCount || 0
      });

    } catch (error: any) {
      toast.error("Erreur", { description: "Impossible de charger les statistiques" });
    }
  };

  if (authLoading || revenueLoading) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement du tableau de bord...</p>
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

  const chartData = processDataByPeriod(selectedPeriod);

  return (
    <div className="flex min-h-screen bg-background">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 space-y-8">
          {/* Modern Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Administrateur</h1>
                <p className="text-sm text-muted-foreground">Connecté en tant qu'administrateur: {user?.email}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics - Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <ModernStatCard
              title="Total encaissé (début)"
              value={new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 0,
              }).format(totalRevenueSinceBeginning) + ' FCFA'}
              icon={<DollarSign className="w-6 h-6" />}
              color="green"
              change={{
                value: `${growthRate.toFixed(1)}%`,
                label: "vs mois dernier",
                isPositive: growthRate > 0
              }}
              trend={growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral'}
            />
            
            <ModernStatCard
              title="Établissements actifs"
              value={activeRestaurants}
              icon={<Building2 className="w-6 h-6" />}
              color="blue"
            />

            <ModernStatCard
              title="Encaissé ce mois"
              value={new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 0,
              }).format(currentMonthRevenue) + ' FCFA'}
              icon={<TrendingUp className="w-6 h-6" />}
              color="purple"
              change={{
                value: `${activeRestaurants}`,
                label: "abonnés actifs",
                isPositive: true
              }}
            />

            <ModernStatCard
              title="CA Restaurants"
              value="0 FCFA"
              icon={<Target className="w-6 h-6" />}
              color="orange"
            />
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Évolution des revenus</h3>
                <PeriodSelector 
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                />
              </div>
              <RevenueChart data={chartData} period={selectedPeriod} />
            </div>
            
            <div>
              <ChurnRateCard data={churnData} period={selectedPeriod} />
            </div>
          </div>

          {/* Business Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Métriques business</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Croissance MoM</span>
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Par rapport au mois dernier</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Valeur vie client</span>
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {activeRestaurants > 0 
                      ? new Intl.NumberFormat('fr-FR', {
                          minimumFractionDigits: 0,
                        }).format((totalRevenueSinceBeginning / activeRestaurants) * 12) + ' FCFA'
                      : '0 FCFA'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Estimation annuelle moyenne</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Revenu moyen / resto</span>
                    <Target className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {activeRestaurants > 0 
                      ? new Intl.NumberFormat('fr-FR', {
                          minimumFractionDigits: 0,
                        }).format(totalRevenueSinceBeginning / activeRestaurants) + ' FCFA'
                      : '0 FCFA'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Revenus par établissement</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Platform Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Statistiques plateforme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <ModernStatCard
                title="Plats créés"
                value={stats.totalDishes}
                icon={<ChefHat className="w-6 h-6" />}
                color="blue"
              />
              
              <ModernStatCard
                title="Commandes totales"
                value={stats.totalOrders}
                icon={<ShoppingCart className="w-6 h-6" />}
                color="green"
              />

              <ModernStatCard
                title="Taux d'adoption"
                value={`${stats.totalUsers > 0 ? ((activeRestaurants / stats.totalUsers) * 100).toFixed(1) : 0}%`}
                icon={<Target className="w-6 h-6" />}
                color="purple"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20"
                onClick={() => window.location.href = '/admin/subscriptions'}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <CreditCard className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base text-foreground mb-1">Gérer les abonnements</h4>
                      <p className="text-sm text-muted-foreground">Modifier les plans et statuts</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                        Ouvrir →
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20"
                onClick={() => window.location.href = '/admin/roles'}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                      <Users className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base text-foreground mb-1">Gérer les rôles</h4>
                      <p className="text-sm text-muted-foreground">Configurer les permissions</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium">
                        Ouvrir →
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Subscribers by Plan */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Utilisateurs actifs par plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Plan Starter</span>
                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                      35 000 FCFA
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {subscribersByPlan.starter}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">abonnés actifs</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Plan Premium</span>
                    <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                      65 000 FCFA
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {subscribersByPlan.premium}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">abonnés actifs</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Plan Pro / Entreprise</span>
                    <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-medium">
                      91 000 FCFA
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {subscribersByPlan.pro}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">abonnés actifs</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Revenue Projection Calculator */}
          <div>
            <RevenueProjectionCalculator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
