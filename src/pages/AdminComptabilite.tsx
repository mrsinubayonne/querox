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
  totalSubscriptionRevenue: number;
  monthlyRevenue: number;
  activeSubscribers: number;
  starterCount: number;
  premiumCount: number;
  proCount: number;
  trialingCount: number;
  cancelledCount: number;
}

interface SubscriptionTransaction {
  id: string;
  email: string;
  tier: string;
  status: string;
  amount: number;
  date: string;
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
    cancelledCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<SubscriptionTransaction[]>([]);

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

      // Fetch all subscribers
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('id, email, subscription_tier, subscription_status, subscription_start, updated_at, created_at')
        .order('updated_at', { ascending: false });

      if (!subscribers) {
        toast.error('Erreur lors du chargement des abonnements');
        return;
      }

      // Calculate stats
      const activeSubscribers = subscribers.filter(s => s.subscription_status === 'active').length;
      const starterCount = subscribers.filter(s => s.subscription_tier === 'starter' && s.subscription_status === 'active').length;
      const premiumCount = subscribers.filter(s => s.subscription_tier === 'premium' && s.subscription_status === 'active').length;
      const proCount = subscribers.filter(s => s.subscription_tier === 'pro' && s.subscription_status === 'active').length;
      const trialingCount = subscribers.filter(s => s.subscription_status === 'trialing').length;
      const cancelledCount = subscribers.filter(s => s.subscription_status === 'cancelled').length;

      // Calculate subscription revenue
      const prices = { starter: 35000, premium: 65000, pro: 91000 };
      const totalSubscriptionRevenue = subscribers.reduce((sum, s) => {
        if (s.subscription_status === 'active') {
          return sum + (prices[s.subscription_tier as keyof typeof prices] || 0);
        }
        return sum;
      }, 0);

      // Monthly revenue (subscriptions that started or renewed this month)
      const monthlyRevenue = subscribers
        .filter(s => {
          const date = new Date(s.subscription_start || s.created_at);
          return date >= firstDayOfMonth && s.subscription_status === 'active';
        })
        .reduce((sum, s) => sum + (prices[s.subscription_tier as keyof typeof prices] || 0), 0);

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
        totalSubscriptionRevenue,
        monthlyRevenue,
        activeSubscribers,
        starterCount,
        premiumCount,
        proCount,
        trialingCount,
        cancelledCount
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
              <h1 className="text-3xl font-bold text-foreground">Comptabilité Querox</h1>
              <p className="text-sm text-muted-foreground">Revenus des abonnements et gestion financière de la plateforme</p>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">MRR Total</span>
                  <DollarSign className="w-5 h-5 opacity-90" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.totalSubscriptionRevenue.toLocaleString('fr-FR')} FCFA
                </div>
                <p className="text-xs opacity-80 mt-1">Revenu mensuel récurrent</p>
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
                <p className="text-xs text-muted-foreground mt-1">Nouveaux abonnements</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Abonnés Actifs</span>
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.activeSubscribers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Comptes payants</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Essais Gratuits</span>
                  <Receipt className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold">
                  {stats.trialingCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">En période d'essai</p>
              </CardContent>
            </Card>
          </div>

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
