
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminRevenue } from '@/hooks/useAdminRevenue';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import ModernStatCard from '@/components/ModernStatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import ChurnRateCard from '@/components/admin/ChurnRateCard';
import PeriodSelector from '@/components/admin/PeriodSelector';
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
  const { toast } = useToast();

  const {
    revenueStats,
    churnData,
    loading: revenueLoading,
    processDataByPeriod,
    getTotalRevenue,
    getActiveRestaurants,
    getGrowthRate
  } = useAdminRevenue();

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
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    }
  };

  if (authLoading || revenueLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  const chartData = processDataByPeriod(selectedPeriod);
  const totalRevenue = getTotalRevenue();
  const activeRestaurants = getActiveRestaurants();
  const growthRate = getGrowthRate();

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <AdminHeader userEmail={user?.email} />
            <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
          
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ModernStatCard
              title="Chiffre d'affaires total"
              value={`${totalRevenue.toFixed(2)} €`}
              icon={<DollarSign className="w-6 h-6" />}
              color="green"
              change={{
                value: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
                label: "vs mois précédent",
                isPositive: growthRate >= 0
              }}
              trend={growthRate >= 0 ? "up" : "down"}
            />

            <ModernStatCard
              title="Restaurants actifs"
              value={activeRestaurants.toLocaleString()}
              icon={<Building2 className="w-6 h-6" />}
              color="blue"
              change={{
                value: "Abonnements payants",
                label: "Utilisateurs QUEROX",
                isPositive: true
              }}
              trend="up"
            />

            <ModernStatCard
              title="Utilisateurs totaux"
              value={stats.totalUsers.toLocaleString()}
              icon={<Users className="w-6 h-6" />}
              color="purple"
              change={{
                value: "Total des comptes",
                label: "Base utilisateurs",
                isPositive: true
              }}
              trend="up"
            />

            <ModernStatCard
              title="Taux de conversion"
              value={`${stats.totalUsers > 0 ? ((activeRestaurants / stats.totalUsers) * 100).toFixed(1) : 0}%`}
              icon={<Target className="w-6 h-6" />}
              color="orange"
              change={{
                value: "Abonnés/Inscrits",
                label: "Performance commerciale",
                isPositive: true
              }}
              trend="up"
            />
          </div>

          {/* Graphiques et analyse */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <RevenueChart data={chartData} period={selectedPeriod} />
            </div>
            <div>
              <ChurnRateCard data={churnData} period={selectedPeriod} />
            </div>
          </div>

          {/* Statistiques complémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ModernStatCard
              title="Plats créés"
              value={stats.totalDishes.toLocaleString()}
              icon={<ChefHat className="w-6 h-6" />}
              color="orange"
              change={{
                value: "Dans tous les menus",
                label: "Contenu plateforme",
                isPositive: true
              }}
              trend="neutral"
            />

            <ModernStatCard
              title="Commandes totales"
              value={stats.totalOrders.toLocaleString()}
              icon={<ShoppingCart className="w-6 h-6" />}
              color="purple"
              change={{
                value: "Volume d'activité",
                label: "Utilisation plateforme",
                isPositive: true
              }}
              trend="up"
            />

            <ModernStatCard
              title="Revenus moyens/restaurant"
              value={`${activeRestaurants > 0 ? (totalRevenue / activeRestaurants).toFixed(2) : 0} €`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
              change={{
                value: "ARPU mensuel",
                label: "Revenue par utilisateur",
                isPositive: true
              }}
              trend="up"
            />
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => window.location.href = '/admin/subscriptions'}
                  className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">Gestion des abonnements</h3>
                      <p className="text-sm text-blue-600">Gérer les abonnements utilisateurs</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/admin/roles'}
                  className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-purple-900">Gestion des rôles</h3>
                      <p className="text-sm text-purple-600">Assigner des rôles admin/éditeur</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyse de croissance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Croissance mensuelle</span>
                    <span className={`font-medium ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Taux d'attrition actuel</span>
                    <span className="font-medium text-orange-600">
                      {churnData[0]?.churn_rate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Revenus moyens par utilisateur</span>
                    <span className="font-medium text-blue-600">
                      {activeRestaurants > 0 ? (totalRevenue / activeRestaurants).toFixed(2) : 0} €
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
