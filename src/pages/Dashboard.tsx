import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Users, 
  DollarSign, 
  Package, 
  BarChart2,
  Globe,
  QrCode,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Clock,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
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

  // Display name logic
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
        const now = new Date();
        
        if (expiresAt > now) {
          toast({
            title: "Accès autorisé",
            description: "Connexion via QR Code réussie",
            variant: "default",
          });
        } else {
          toast({
            title: "QR Code expiré",
            description: "Veuillez générer un nouveau QR Code",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "QR Code invalide",
          description: "Le code QR semble corrompu",
          variant: "destructive",
        });
      }
    }
  }, [location.search, user, toast]);

  const quickActions = [
    {
      title: "Gérer les Menus",
      description: "Créez et modifiez vos cartes de menu",
      icon: Menu,
      link: "/menus",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Comptabilité",
      description: "Gérez vos finances et transactions",
      icon: DollarSign,
      link: "/comptabilite",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Inventaire",
      description: "Suivez votre stock et approvisionnements",
      icon: Package,
      link: "/inventaire",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Statistiques",
      description: "Analysez les performances de votre restaurant",
      icon: BarChart2,
      link: "/statistiques",
      color: "from-violet-500 to-violet-600"
    },
    {
      title: "Site Web",
      description: "Personnalisez votre présence en ligne",
      icon: Globe,
      link: "/site-web",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "QR Codes",
      description: "Générez des QR codes pour vos menus",
      icon: QrCode,
      link: "/qr-codes",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Marketing",
      description: "Gérez vos campagnes marketing",
      icon: MessageSquare,
      link: "/marketing",
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <SubscriptionGuard feature="le tableau de bord">
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
          <div className="p-4 md:p-8">
            {/* Hero Section */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50 shadow-lg">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Bienvenue sur QUEROX, {displayName}!
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">
                  Statistiques en temps réel de vos activités
                </p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="mb-8 flex gap-2 p-1 bg-muted/50 rounded-xl w-fit backdrop-blur-sm">
              <Button
                variant={period === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('day')}
                className={period === 'day' ? 'shadow-md' : 'hover:bg-background/80'}
              >
                Jour
              </Button>
              <Button
                variant={period === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('week')}
                className={period === 'week' ? 'shadow-md' : 'hover:bg-background/80'}
              >
                Semaine
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('month')}
                className={period === 'month' ? 'shadow-md' : 'hover:bg-background/80'}
              >
                Mois
              </Button>
            </div>

            {/* Main Stats */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/30 rounded-full" />
                Vue d'ensemble
              </h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
                    <ModernStatCard
                      title="Chiffre d'affaires"
                      value={`${stats.revenue.toFixed(0)} XAF`}
                      icon={<DollarSign className="h-5 w-5" />}
                      color="green"
                      trend={stats.revenueChange >= 0 ? 'up' : 'down'}
                      change={{
                        value: `${stats.revenueChange.toFixed(1)}%`,
                        label: "vs période précédente",
                        isPositive: stats.revenueChange >= 0
                      }}
                    />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <ModernStatCard
                      title="Commandes"
                      value={stats.totalOrders}
                      icon={<ShoppingBag className="h-5 w-5" />}
                      color="blue"
                      trend={stats.ordersChange >= 0 ? 'up' : 'down'}
                      change={{
                        value: `${stats.ordersChange.toFixed(1)}%`,
                        label: "vs période précédente",
                        isPositive: stats.ordersChange >= 0
                      }}
                    />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <ModernStatCard
                      title="Taux de réussite"
                      value={`${stats.successRate.toFixed(1)}%`}
                      icon={<TrendingUp className="h-5 w-5" />}
                      color="purple"
                      trend={stats.successRate >= 80 ? 'up' : 'down'}
                      change={{
                        value: "Livraison/Collecte",
                        label: "taux de réussite",
                        isPositive: stats.successRate >= 80
                      }}
                    />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <ModernStatCard
                      title="Panier moyen"
                      value={`${stats.averageCart.toFixed(0)} XAF`}
                      icon={<Receipt className="h-5 w-5" />}
                      color="orange"
                      trend="neutral"
                      change={{
                        value: `${stats.totalOrders} commandes`,
                        label: "cette période",
                        isPositive: true
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Top Products & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Top Products */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    Top 3 Produits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                      ))}
                    </div>
                  ) : stats.topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {stats.topProducts.map((product, index) => (
                        <div 
                          key={index} 
                          className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold shadow-lg group-hover:scale-110 transition-transform">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3" />
                                {product.quantity} vendus
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {product.revenue.toFixed(0)}
                            </p>
                            <p className="text-xs text-muted-foreground">XAF</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Aucune vente pour cette période
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    Alertes rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.lowStockItems.length > 0 && (
                        <Alert className="border-0 bg-gradient-to-r from-orange-500/10 to-orange-500/5 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            <AlertDescription className="text-orange-900 dark:text-orange-200">
                              <p className="font-bold text-base mb-2">
                                Stock faible: {stats.lowStockItems.length} article(s)
                              </p>
                              <div className="space-y-2">
                                {stats.lowStockItems.slice(0, 3).map((item, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                                    <span className="font-medium">{item.name}</span>
                                    <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20">
                                      {item.stock}/{item.minStock}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                      
                      {stats.delayedOrders.length > 0 && (
                        <Alert className="border-0 bg-gradient-to-r from-red-500/10 to-red-500/5 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                              <Clock className="h-5 w-5 text-red-600" />
                            </div>
                            <AlertDescription className="text-red-900 dark:text-red-200">
                              <p className="font-bold text-base mb-2">
                                Commandes en retard: {stats.delayedOrders.length} commande(s)
                              </p>
                              <div className="space-y-2">
                                {stats.delayedOrders.slice(0, 3).map((order, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                                    <span className="font-medium">{order.customerName}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}

                      {stats.lowStockItems.length === 0 && stats.delayedOrders.length === 0 && (
                        <div className="text-center py-12">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                            <span className="text-4xl">👍</span>
                          </div>
                          <p className="text-lg font-medium text-foreground">Tout va bien !</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Aucune alerte pour le moment
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Accès Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Configurer →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Démarrage rapide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">1. Créez votre premier menu</span>
                    <Link to="/menus">
                      <Button size="sm">Commencer</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">2. Configurez votre site web</span>
                    <Link to="/site-web">
                      <Button size="sm" variant="outline">Configurer</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">3. Générez vos QR codes</span>
                    <Link to="/qr-codes">
                      <Button size="sm" variant="outline">Générer</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités populaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/inventaire" className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Gestion d'inventaire</span>
                    </div>
                  </Link>
                  <Link to="/comptabilite" className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Suivi financier</span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <OnboardingTour />
    </SubscriptionGuard>
  );
};

export default Dashboard;
