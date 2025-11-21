import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Receipt, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  subscriptionRevenue: number;
  transactionCount: number;
  activeSubscribers: number;
  averageOrderValue: number;
}

interface RecentTransaction {
  id: string;
  outlet_name: string;
  amount: number;
  type: 'subscription' | 'order' | 'invoice';
  date: string;
  status: string;
}

const AdminComptabilite: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    subscriptionRevenue: 0,
    transactionCount: 0,
    activeSubscribers: 0,
    averageOrderValue: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchFinancialData();
    }
  }, [isAdmin]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Get current month range
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

      // Fetch all orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, outlet_id, outlets(name)');

      // Fetch all invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, created_at, status, outlet_id, outlets(name)')
        .eq('status', 'paid');

      // Fetch subscribers
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('subscription_tier, subscription_status, created_at');

      const activeSubscribers = subscribers?.filter(s => s.subscription_status === 'active').length || 0;

      // Calculate revenues
      const ordersRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const invoicesRevenue = invoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
      const totalRevenue = ordersRevenue + invoicesRevenue;

      // Monthly revenue
      const monthlyOrders = orders?.filter(o => new Date(o.created_at) >= firstDayOfMonth) || [];
      const monthlyInvoices = invoices?.filter(i => new Date(i.created_at) >= firstDayOfMonth) || [];
      const monthlyRevenue = 
        monthlyOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) +
        monthlyInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);

      // Subscription revenue (estimation based on tiers)
      const subscriptionRevenue = subscribers?.reduce((sum, s) => {
        if (s.subscription_status !== 'active') return sum;
        const prices = { starter: 35000, premium: 65000, pro: 91000 };
        return sum + (prices[s.subscription_tier as keyof typeof prices] || 0);
      }, 0) || 0;

      // Recent transactions
      const transactions: RecentTransaction[] = [
        ...monthlyOrders.slice(0, 10).map(o => ({
          id: o.outlet_id || '',
          outlet_name: (o as any).outlets?.name || 'PDV inconnu',
          amount: o.total_amount,
          type: 'order' as const,
          date: o.created_at,
          status: 'completed'
        })),
        ...monthlyInvoices.slice(0, 10).map(i => ({
          id: i.outlet_id || '',
          outlet_name: (i as any).outlets?.name || 'PDV inconnu',
          amount: i.total_amount,
          type: 'invoice' as const,
          date: i.created_at,
          status: i.status
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

      setStats({
        totalRevenue,
        monthlyRevenue,
        subscriptionRevenue,
        transactionCount: (orders?.length || 0) + (invoices?.length || 0),
        activeSubscribers,
        averageOrderValue: orders?.length ? ordersRevenue / orders.length : 0
      });

      setRecentTransactions(transactions);

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
        <div className="p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comptabilité</h1>
              <p className="text-sm text-muted-foreground">Vue d'ensemble financière de la plateforme</p>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Revenus Totaux</span>
                  <DollarSign className="w-5 h-5 opacity-90" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.totalRevenue.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs opacity-80 mt-1">Tous les temps</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Revenus du Mois</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.monthlyRevenue.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs text-muted-foreground mt-1">Mois en cours</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Revenus Abonnements</span>
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.subscriptionRevenue.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.activeSubscribers} abonnés actifs</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Transactions</span>
                  <Receipt className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.transactionCount.toLocaleString('fr-FR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Commandes et factures</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Panier Moyen</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.averageOrderValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA
                </div>
                <p className="text-xs text-muted-foreground mt-1">Par commande</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Transactions Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune transaction récente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${transaction.type === 'order' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <div>
                          <p className="font-semibold">{transaction.outlet_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {transaction.type === 'order' ? 'Commande' : 'Facture'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {transaction.amount.toLocaleString('fr-FR')} FCFA
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
