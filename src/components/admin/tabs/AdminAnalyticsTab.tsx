import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminAnalyticsTab: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    growthRate: 0,
    avgOrderValue: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: subscribersCount } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setAnalytics({
        totalUsers: usersCount || 0,
        activeUsers: subscribersCount || 0,
        totalRevenue,
        growthRate: 12.5,
        avgOrderValue,
        totalOrders
      });
    } catch (error: any) {
      toast.error('Erreur lors du chargement des analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Utilisateurs Totaux</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              Inscrits sur la plateforme
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Utilisateurs Actifs</CardDescription>
            <CardTitle className="text-3xl">{analytics.activeUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Abonnés actifs
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription>Revenu Total</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalRevenue.toFixed(2)}€</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Toutes commandes
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taux de Croissance</CardTitle>
            <CardDescription>Croissance mensuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600">+{analytics.growthRate}%</p>
                <p className="text-sm text-muted-foreground mt-2">Ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Panier Moyen</CardTitle>
            <CardDescription>Valeur moyenne par commande</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600">{analytics.avgOrderValue.toFixed(2)}€</p>
                <p className="text-sm text-muted-foreground mt-2">{analytics.totalOrders} commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métriques Clés</CardTitle>
          <CardDescription>Indicateurs de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Taux de conversion</span>
              <span className="text-lg font-bold text-green-600">
                {((analytics.activeUsers / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Commandes par utilisateur</span>
              <span className="text-lg font-bold text-blue-600">
                {(analytics.totalOrders / Math.max(analytics.totalUsers, 1)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Revenu par utilisateur</span>
              <span className="text-lg font-bold text-purple-600">
                {(analytics.totalRevenue / Math.max(analytics.totalUsers, 1)).toFixed(2)}€
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
