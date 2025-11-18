import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, CreditCard, TrendingUp, DollarSign, Activity, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalRestaurants: number;
}

export const AdminOverviewTab: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    totalRestaurants: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active subscribers
      const { count: subscribersCount } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      // Total orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Total restaurants (outlets)
      const { count: outletsCount } = await supabase
        .from('outlets')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        activeSubscribers: subscribersCount || 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalOrders: ordersCount || 0,
        totalRestaurants: outletsCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Utilisateurs Total",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Comptes créés",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Abonnés Actifs",
      value: stats.activeSubscribers.toLocaleString(),
      icon: CreditCard,
      description: "Abonnements en cours",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Restaurants",
      value: stats.totalRestaurants.toLocaleString(),
      icon: Building2,
      description: "Points de vente créés",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Commandes",
      value: stats.totalOrders.toLocaleString(),
      icon: Activity,
      description: "Total des commandes",
      color: "from-orange-500 to-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-none shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Aperçu de l'activité
          </CardTitle>
          <CardDescription>
            Vue d'ensemble de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium">Taux de conversion</p>
                <p className="text-sm text-muted-foreground">Visiteurs → Abonnés</p>
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.totalUsers > 0 
                  ? ((stats.activeSubscribers / stats.totalUsers) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium">Restaurants par utilisateur</p>
                <p className="text-sm text-muted-foreground">Moyenne</p>
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.totalUsers > 0 
                  ? (stats.totalRestaurants / stats.totalUsers).toFixed(1)
                  : 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
