
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ModernSidebar from '@/components/ModernSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import ModernStatCard from '@/components/ModernStatCard';
import { 
  DollarSign, 
  Users, 
  ChefHat, 
  ShoppingCart, 
  CreditCard,
  TrendingUp
} from 'lucide-react';

const ADMIN_EMAILS = [
  'emmanuelhussinbayonne@gmail.com',
  'bayonnecastadorkhloe@gmail.com', 
  'mrsinulion@gmail.com'
];

interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalDishes: number;
  totalOrders: number;
  activeSubscriptions: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalUsers: 0,
    totalDishes: 0,
    totalOrders: 0,
    activeSubscriptions: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthorization();
  }, [user]);

  useEffect(() => {
    if (isAuthorized) {
      fetchDashboardStats();
    }
  }, [isAuthorized]);

  const checkAuthorization = () => {
    console.log('🔍 AdminDashboard - Vérification des autorisations');
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      setLoading(false);
      return;
    }

    if (ADMIN_EMAILS.includes(user.email || '')) {
      console.log('✅ Utilisateur autorisé comme admin QUEROX');
      setIsAuthorized(true);
    } else {
      console.log('❌ Utilisateur non autorisé');
      setIsAuthorized(false);
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas l'autorisation d'accéder à l'interface administrateur QUEROX",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const fetchDashboardStats = async () => {
    console.log('📊 Récupération des statistiques globales QUEROX...');
    
    try {
      // Nombre total d'utilisateurs (profiles)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Nombre total de plats créés
      const { count: dishesCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      // Nombre total de commandes
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Calcul du chiffre d'affaires total (commandes terminées)
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const totalRevenue = completedOrders?.reduce((sum, order) => 
        sum + Number(order.total_amount), 0) || 0;

      // Nombre d'abonnements actifs
      const { count: activeSubsCount } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      setStats({
        totalRevenue,
        totalUsers: usersCount || 0,
        totalDishes: dishesCount || 0,
        totalOrders: ordersCount || 0,
        activeSubscriptions: activeSubsCount || 0
      });

      console.log('✅ Statistiques chargées:', {
        totalRevenue,
        totalUsers: usersCount,
        totalDishes: dishesCount,
        totalOrders: ordersCount,
        activeSubscriptions: activeSubsCount
      });

    } catch (error: any) {
      console.error('💥 Erreur lors du chargement des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Vérification des autorisations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <AdminHeader userEmail={user?.email} />
          
          {/* Statistiques globales QUEROX */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ModernStatCard
              title="Chiffre d'affaires total"
              value={`${stats.totalRevenue.toFixed(2)} €`}
              icon={<DollarSign className="w-6 h-6" />}
              color="green"
              change={{
                value: "Toutes commandes terminées",
                label: "Revenue global QUEROX",
                isPositive: true
              }}
              trend="up"
            />

            <ModernStatCard
              title="Utilisateurs inscrits"
              value={stats.totalUsers.toLocaleString()}
              icon={<Users className="w-6 h-6" />}
              color="blue"
              change={{
                value: "Total des comptes",
                label: "Utilisateurs QUEROX",
                isPositive: true
              }}
              trend="up"
            />

            <ModernStatCard
              title="Plats créés"
              value={stats.totalDishes.toLocaleString()}
              icon={<ChefHat className="w-6 h-6" />}
              color="orange"
              change={{
                value: "Dans tous les menus",
                label: "Plats sur la plateforme",
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
                value: "Toutes commandes",
                label: "Volume d'activité",
                isPositive: true
              }}
              trend="up"
            />

            <ModernStatCard
              title="Abonnements actifs"
              value={stats.activeSubscriptions.toLocaleString()}
              icon={<CreditCard className="w-6 h-6" />}
              color="green"
              change={{
                value: "Abonnements payants",
                label: "Revenus récurrents",
                isPositive: true
              }}
              trend="up"
            />

            <ModernStatCard
              title="Taux de conversion"
              value={`${stats.totalOrders > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="blue"
              change={{
                value: "Abonnés/Utilisateurs",
                label: "Performance commerciale",
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
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Nouvelles commandes aujourd'hui</span>
                    <span className="font-medium">En développement</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Nouveaux utilisateurs cette semaine</span>
                    <span className="font-medium">En développement</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Abonnements expirés</span>
                    <span className="font-medium">En développement</span>
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
