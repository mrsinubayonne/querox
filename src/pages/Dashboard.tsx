import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Menu, DollarSign, Package, BarChart2, Globe, QrCode, MessageSquare,
  ShoppingBag, TrendingUp, Receipt, AlertTriangle, Clock, ArrowRight
} from 'lucide-react';
import ModernSidebar from '@/components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import ModernStatCard from '@/components/ModernStatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import OnboardingTour from '@/components/OnboardingTour';

type Period = 'day' | 'week' | 'month';

const Dashboard: React.FC = () => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [period, setPeriod] = useState<Period>('day');
  const { stats, loading } = useDashboardStats(period);

  const displayName = isTeamMember && teamMemberSession 
    ? teamMemberSession.memberEmail 
    : (user?.user_metadata?.full_name || user?.email);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autoToken = params.get('auto_token');
    if (autoToken && user) {
      try {
        const tokenData = JSON.parse(atob(autoToken));
        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt > new Date()) {
          toast({ title: "Accès autorisé", description: "Connexion via QR Code réussie" });
        } else {
          toast({ title: "QR Code expiré", description: "Veuillez générer un nouveau QR Code", variant: "destructive" });
        }
      } catch {
        toast({ title: "QR Code invalide", description: "Le code QR semble corrompu", variant: "destructive" });
      }
    }
  }, [location.search, user, toast]);

  const quickActions = [
    { title: "Menus", description: "Créez et modifiez vos cartes", icon: Menu, link: "/menus", gradient: "from-emerald-500 to-teal-600" },
    { title: "Comptabilité", description: "Finances et transactions", icon: DollarSign, link: "/comptabilite", gradient: "from-amber-500 to-orange-600" },
    { title: "Inventaire", description: "Stock et approvisionnements", icon: Package, link: "/inventaire", gradient: "from-rose-500 to-red-600" },
    { title: "Statistiques", description: "Performance du restaurant", icon: BarChart2, link: "/statistiques", gradient: "from-violet-500 to-purple-600" },
    { title: "Site Web", description: "Présence en ligne", icon: Globe, link: "/site-web", gradient: "from-cyan-500 to-blue-600" },
    { title: "QR Codes", description: "Menus digitaux", icon: QrCode, link: "/qr-codes", gradient: "from-indigo-500 to-blue-700" },
  ];

  return (
    <SubscriptionGuard feature="le tableau de bord">
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Hero */}
            <div className="animate-fade-in">
              <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-primary/5 via-card to-card border border-border/50 shadow-elegant">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Bonjour,</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                    {displayName} 👋
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Voici le résumé de votre activité
                  </p>
                </div>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit animate-fade-in" style={{ animationDelay: '100ms' }}>
              {(['day', 'week', 'month'] as Period[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={`text-xs ${period === p ? 'shadow-md' : 'hover:bg-background/80'}`}
                >
                  {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
                </Button>
              ))}
            </div>

            {/* Stats */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Chiffre d'affaires", value: `${stats.revenue.toFixed(0)} XAF`, icon: <DollarSign className="h-5 w-5" />, color: 'green' as const, trend: stats.revenueChange >= 0 ? 'up' as const : 'down' as const, change: { value: `${stats.revenueChange.toFixed(1)}%`, label: "vs période précédente", isPositive: stats.revenueChange >= 0 } },
                  { title: "Commandes", value: stats.totalOrders, icon: <ShoppingBag className="h-5 w-5" />, color: 'blue' as const, trend: stats.ordersChange >= 0 ? 'up' as const : 'down' as const, change: { value: `${stats.ordersChange.toFixed(1)}%`, label: "vs période précédente", isPositive: stats.ordersChange >= 0 } },
                  { title: "Taux de réussite", value: `${stats.successRate.toFixed(1)}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'purple' as const, trend: stats.successRate >= 80 ? 'up' as const : 'down' as const, change: { value: "Livraison", label: "taux de réussite", isPositive: stats.successRate >= 80 } },
                  { title: "Panier moyen", value: `${stats.averageCart.toFixed(0)} XAF`, icon: <Receipt className="h-5 w-5" />, color: 'orange' as const, trend: 'neutral' as const, change: { value: `${stats.totalOrders} cmd`, label: "cette période", isPositive: true } },
                ].map((stat, i) => (
                  <div key={stat.title} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                    <ModernStatCard {...stat} />
                  </div>
                ))}
              </div>
            )}

            {/* Top Products & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-elegant animate-fade-in" style={{ animationDelay: '200ms' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    Top Produits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                  ) : stats.topProducts.length > 0 ? (
                    <div className="space-y-2">
                      {stats.topProducts.map((product, index) => (
                        <div key={index} className="group flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-sm flex items-center justify-center shadow-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.quantity} vendus</p>
                            </div>
                          </div>
                          <span className="font-bold text-sm gradient-text">{product.revenue.toFixed(0)} XAF</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune vente pour cette période</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-elegant animate-fade-in" style={{ animationDelay: '300ms' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-lg">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    Alertes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                  ) : (
                    <div className="space-y-3">
                      {stats.lowStockItems.length > 0 && (
                        <div className="p-3 rounded-xl bg-warning/5 border border-warning/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-warning" />
                            <span className="text-sm font-semibold">Stock faible: {stats.lowStockItems.length} article(s)</span>
                          </div>
                          <div className="space-y-1.5">
                            {stats.lowStockItems.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-background/50 rounded-lg">
                                <span className="font-medium">{item.name}</span>
                                <Badge variant="outline" className="text-[10px] bg-warning/10 border-warning/20">{item.stock}/{item.minStock}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {stats.delayedOrders.length > 0 && (
                        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-destructive animate-pulse" />
                            <span className="text-sm font-semibold">En retard: {stats.delayedOrders.length} commande(s)</span>
                          </div>
                          <div className="space-y-1.5">
                            {stats.delayedOrders.slice(0, 3).map((order, i) => (
                              <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-background/50 rounded-lg">
                                <span className="font-medium">{order.customerName}</span>
                                <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {stats.lowStockItems.length === 0 && stats.delayedOrders.length === 0 && (
                        <div className="text-center py-8">
                          <span className="text-3xl mb-2 block">✅</span>
                          <p className="text-sm font-medium">Tout va bien !</p>
                          <p className="text-xs text-muted-foreground">Aucune alerte pour le moment</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-bold mb-4 font-display">Accès Rapide</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <div className="group p-4 rounded-xl border border-border/50 bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">{action.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <Card className="border-border/50 shadow-elegant animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">Démarrage rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: '1. Créez votre premier menu', link: '/menus', cta: 'Commencer' },
                  { label: '2. Configurez votre site web', link: '/site-web', cta: 'Configurer' },
                  { label: '3. Générez vos QR codes', link: '/qr-codes', cta: 'Générer' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium">{step.label}</span>
                    <Link to={step.link}>
                      <Button size="sm" variant={i === 0 ? 'default' : 'outline'} className="text-xs gap-1">
                        {step.cta} <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <OnboardingTour />
    </SubscriptionGuard>
  );
};

export default Dashboard;
