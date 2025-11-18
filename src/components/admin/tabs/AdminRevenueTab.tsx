import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminRevenueTab: React.FC = () => {
  const [revenue, setRevenue] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    subscriptionRevenue: 0,
    ordersRevenue: 0,
    invoicesRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      // Revenus des commandes
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at');

      const ordersRevenue = orders?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;

      // Revenus des factures payées
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, created_at')
        .eq('status', 'paid');

      const invoicesRevenue = invoices?.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0;

      // Revenus des abonnements
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('subscription_tier')
        .eq('subscribed', true);

      const subscriptionRevenue = subscribers?.reduce((sum, s) => {
        const tierPrices: Record<string, number> = {
          'starter': 35000,
          'premium': 65000,
          'pro': 91000
        };
        return sum + (tierPrices[s.subscription_tier || ''] || 0);
      }, 0) || 0;

      // Calcul du revenu du mois en cours
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = orders?.filter(o => {
        const date = new Date(o.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;

      const totalRevenue = ordersRevenue + invoicesRevenue;

      setRevenue({
        totalRevenue,
        monthlyRevenue,
        subscriptionRevenue,
        ordersRevenue,
        invoicesRevenue
      });
    } catch (error: any) {
      toast.error('Erreur lors du chargement des revenus');
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Revenu Total</CardDescription>
            <CardTitle className="text-3xl">{revenue.totalRevenue.toFixed(2)}€</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Toutes sources
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Revenu Mensuel</CardDescription>
            <CardTitle className="text-3xl">{revenue.monthlyRevenue.toFixed(2)}€</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ce mois
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription>Abonnements</CardDescription>
            <CardTitle className="text-3xl">{revenue.subscriptionRevenue.toFixed(2)}€</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 mr-2" />
              Récurrent
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Projection Annuelle</CardDescription>
            <CardTitle className="text-3xl">{(revenue.monthlyRevenue * 12).toFixed(2)}€</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <PieChart className="w-4 h-4 mr-2" />
              Basée sur mois actuel
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Revenus</CardTitle>
            <CardDescription>Par source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Commandes</span>
                <span className="text-lg font-bold text-blue-600">{revenue.ordersRevenue.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium">Factures</span>
                <span className="text-lg font-bold text-green-600">{revenue.invoicesRevenue.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="font-medium">Abonnements</span>
                <span className="text-lg font-bold text-purple-600">{revenue.subscriptionRevenue.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métriques Financières</CardTitle>
            <CardDescription>Indicateurs clés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Revenu Moyen Journalier</p>
                <p className="text-2xl font-bold">{(revenue.monthlyRevenue / 30).toFixed(2)}€</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Objectif Mensuel</p>
                <p className="text-2xl font-bold">100,000.00€</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((revenue.monthlyRevenue / 100000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
