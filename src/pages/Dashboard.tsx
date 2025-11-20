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

type Period = 'day' | 'week' | 'month';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [period, setPeriod] = useState<Period>('day');
  const { stats, loading } = useDashboardStats(period);

  // Display name logic
  const displayName = user?.user_metadata?.full_name || user?.email;

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
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue sur QUEROX, {displayName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Voici votre tableau de bord. Statistiques en temps réel de vos activités du jour.
              </p>
            </div>

            {/* Period Selector */}
            <div className="mb-6 flex gap-2">
              <Button
                variant={period === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('day')}
              >
                Jour
              </Button>
              <Button
                variant={period === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('week')}
              >
                Semaine
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('month')}
              >
                Mois
              </Button>
            </div>

            {/* Main Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Vue d'ensemble</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ModernStatCard
                    title="Chiffre d'affaires"
                    value={`${stats.revenue.toFixed(0)} FCFA`}
                    icon={<DollarSign className="h-5 w-5" />}
                    color="green"
                    trend={stats.revenueChange >= 0 ? 'up' : 'down'}
                    change={{
                      value: `${stats.revenueChange.toFixed(1)}%`,
                      label: "vs période précédente",
                      isPositive: stats.revenueChange >= 0
                    }}
                  />
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
                  <ModernStatCard
                    title="Panier moyen"
                    value={`${stats.averageCart.toFixed(0)} FCFA`}
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
              )}
            </div>

            {/* Top Products & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top 3 Produits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : stats.topProducts.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.quantity} vendus
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-primary">
                            {product.revenue.toFixed(0)} FCFA
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune vente pour cette période
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertes rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.lowStockItems.length > 0 && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <Package className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-900">
                            <strong>Stock faible:</strong> {stats.lowStockItems.length} article(s)
                            <div className="mt-2 space-y-1">
                              {stats.lowStockItems.slice(0, 3).map((item, i) => (
                                <div key={i} className="text-sm">
                                  • {item.name}: {item.stock}/{item.minStock}
                                </div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {stats.delayedOrders.length > 0 && (
                        <Alert className="border-red-200 bg-red-50">
                          <Clock className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-900">
                            <strong>Commandes en retard:</strong> {stats.delayedOrders.length} commande(s)
                            <div className="mt-2 space-y-1">
                              {stats.delayedOrders.slice(0, 3).map((order, i) => (
                                <div key={i} className="text-sm">
                                  • {order.customerName} - {new Date(order.createdAt).toLocaleTimeString('fr-FR')}
                                </div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {stats.lowStockItems.length === 0 && stats.delayedOrders.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Aucune alerte pour le moment 👍
                        </p>
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
    </SubscriptionGuard>
  );
};

export default Dashboard;
