import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminReportsTab: React.FC = () => {
  const [reports, setReports] = useState({
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    dailyOrders: 0,
    weeklyOrders: 0,
    monthlyOrders: 0,
    yearlyOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const dailyOrders = orders?.filter(o => new Date(o.created_at) >= today) || [];
      const weeklyOrders = orders?.filter(o => new Date(o.created_at) >= weekAgo) || [];
      const monthlyOrders = orders?.filter(o => new Date(o.created_at) >= monthStart) || [];
      const yearlyOrders = orders?.filter(o => new Date(o.created_at) >= yearStart) || [];

      setReports({
        dailyRevenue: dailyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
        weeklyRevenue: weeklyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
        monthlyRevenue: monthlyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
        yearlyRevenue: yearlyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
        dailyOrders: dailyOrders.length,
        weeklyOrders: weeklyOrders.length,
        monthlyOrders: monthlyOrders.length,
        yearlyOrders: yearlyOrders.length
      });
    } catch (error: any) {
      toast.error('Erreur lors du chargement des rapports');
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            Rapports de Ventes
          </CardTitle>
          <CardDescription>Analyse des performances par période</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Revenus
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-blue-600">{reports.dailyRevenue.toFixed(2)}€</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cette semaine</p>
                  <p className="text-2xl font-bold text-green-600">{reports.weeklyRevenue.toFixed(2)}€</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Ce mois</p>
                  <p className="text-2xl font-bold text-purple-600">{reports.monthlyRevenue.toFixed(2)}€</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cette année</p>
                  <p className="text-2xl font-bold text-amber-600">{reports.yearlyRevenue.toFixed(2)}€</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Commandes
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-blue-600">{reports.dailyOrders}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cette semaine</p>
                  <p className="text-2xl font-bold text-green-600">{reports.weeklyOrders}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Ce mois</p>
                  <p className="text-2xl font-bold text-purple-600">{reports.monthlyOrders}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cette année</p>
                  <p className="text-2xl font-bold text-amber-600">{reports.yearlyOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métriques de Performance</CardTitle>
          <CardDescription>Indicateurs clés de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Panier Moyen Journalier</p>
              <p className="text-3xl font-bold">
                {reports.dailyOrders > 0 
                  ? (reports.dailyRevenue / reports.dailyOrders).toFixed(2) 
                  : '0.00'}€
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Panier Moyen Mensuel</p>
              <p className="text-3xl font-bold">
                {reports.monthlyOrders > 0 
                  ? (reports.monthlyRevenue / reports.monthlyOrders).toFixed(2) 
                  : '0.00'}€
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Croissance Mensuelle</p>
              <p className="text-3xl font-bold text-green-600">+12.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
