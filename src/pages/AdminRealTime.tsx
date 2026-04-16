import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Activity, ShoppingCart, Building2, TrendingUp, Clock, MousePointer, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import ButtonUsageStats from '@/components/admin/ButtonUsageStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';

interface RealtimeOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id?: string;
  outlet_id?: string;
  restaurant_name?: string;
  restaurant_address?: string;
  table_number?: string;
  order_type?: string;
}

interface OutletDailySales {
  outlet_id: string;
  outlet_name: string;
  outlet_address: string;
  daily_revenue: number;
  order_count: number;
  user_email?: string;
}

const AdminRealTime: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RealtimeOrder[]>([]);
  const [liveRevenue, setLiveRevenue] = useState(0);
  const [activeRestaurants, setActiveRestaurants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [outletSales, setOutletSales] = useState<OutletDailySales[]>([]);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');

  useEffect(() => {
    if (isAdmin) {
      fetchRealtimeData();
      
      // Setup realtime subscription
      const channel = supabase
        .channel('admin-realtime')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders' 
        }, (payload) => {
          handleNewOrder(payload.new as RealtimeOrder);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, periodFilter]);

  const getDateRange = (): Date | null => {
    const now = new Date();
    let startDate = new Date();
    
    switch (periodFilter) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        return null;
      case 'today':
      default:
        startDate.setHours(0, 0, 0, 0);
        break;
    }
    
    return startDate;
  };

  const getPeriodLabel = () => {
    switch (periodFilter) {
      case 'week': return 'de la semaine';
      case 'month': return 'du mois';
      case 'all': return 'depuis le début';
      default: return 'du jour';
    }
  };

  const fetchRealtimeData = async () => {
    try {
      setLoading(true);
      
      const startDate = getDateRange();
      
      // Get ALL orders from period with outlet information
      let ordersQuery = supabase
        .from('orders')
        .select(`
          id, 
          customer_name, 
          total_amount, 
          status, 
          created_at, 
          user_id,
          outlet_id,
          table_number,
          order_type,
          outlets!inner (
            id,
            name,
            address,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        ordersQuery = ordersQuery.gte('created_at', startDate.toISOString());
      }

      const { data: todayOrders, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;

      // Get ALL paid invoices from period
      let invoicesQuery = supabase
        .from('invoices')
        .select('id, total_amount, order_id, outlet_id')
        .eq('status', 'paid');

      if (startDate) {
        invoicesQuery = invoicesQuery.gte('created_at', startDate.toISOString());
      }

      const { data: todayInvoices, error: invoicesError } = await invoicesQuery;

      if (invoicesError) throw invoicesError;

      // Map orders with outlet info for recent orders display
      const ordersWithOutletInfo = todayOrders?.map(order => ({
        ...order,
        restaurant_name: (order as any).outlets?.name || 'PDV inconnu',
        restaurant_address: (order as any).outlets?.address || ''
      })) || [];

      // Calculate live revenue (orders + paid invoices without double counting)
      const revenueFromOrders = ordersWithOutletInfo.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      
      const orderIds = new Set(todayOrders?.map(o => o.id) || []);
      const revenueFromPaidInvoices = todayInvoices
        ?.filter(inv => !inv.order_id || !orderIds.has(inv.order_id))
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      
      const todayRevenue = revenueFromOrders + revenueFromPaidInvoices;
      setLiveRevenue(todayRevenue);

      // Count active restaurants
      const uniqueOutlets = new Set(todayOrders?.map(o => o.outlet_id).filter(Boolean));
      setActiveRestaurants(uniqueOutlets.size);

      // Group by outlet and calculate daily sales
      const salesByOutlet = new Map<string, OutletDailySales>();
      
      // Add orders revenue per outlet
      todayOrders?.forEach(order => {
        const outletId = order.outlet_id;
        const outletName = (order as any).outlets?.name || 'PDV inconnu';
        const outletAddress = (order as any).outlets?.address || '';
        
        if (!outletId) return;
        
        if (!salesByOutlet.has(outletId)) {
          salesByOutlet.set(outletId, {
            outlet_id: outletId,
            outlet_name: outletName,
            outlet_address: outletAddress,
            daily_revenue: 0,
            order_count: 0
          });
        }
        
        const current = salesByOutlet.get(outletId)!;
        current.daily_revenue += order.total_amount || 0;
        current.order_count += 1;
      });

      // Add paid invoices revenue per outlet (avoiding double counting)
      todayInvoices
        ?.filter(inv => !inv.order_id || !orderIds.has(inv.order_id))
        .forEach(invoice => {
          const outletId = invoice.outlet_id;
          if (!outletId) return;
          
          if (salesByOutlet.has(outletId)) {
            const current = salesByOutlet.get(outletId)!;
            current.daily_revenue += invoice.total_amount || 0;
          }
        });

      // Convert to array and sort by revenue
      const sortedOutletSales = Array.from(salesByOutlet.values())
        .sort((a, b) => b.daily_revenue - a.daily_revenue);

      setOutletSales(sortedOutletSales);
      setRecentOrders(ordersWithOutletInfo.slice(0, 50)); // Keep last 50 orders
      
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données temps réel');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = (newOrder: RealtimeOrder) => {
    // Refetch all data to update outlet sales and stats
    fetchRealtimeData();
    toast.success('Nouvelle commande reçue!');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Activité Temps Réel</h1>
              <p className="text-sm text-muted-foreground">Surveillance live de la plateforme</p>
            </div>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Commandes
              </TabsTrigger>
              <TabsTrigger value="buttons" className="flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Usage Boutons
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6 mt-6">
              {/* Period Filter */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Période:
                </div>
                <ToggleGroup 
                  type="single" 
                  value={periodFilter} 
                  onValueChange={(value) => value && setPeriodFilter(value as PeriodFilter)}
                  className="bg-muted rounded-lg p-1"
                >
                  <ToggleGroupItem value="today" className="text-sm px-4">
                    Aujourd'hui
                  </ToggleGroupItem>
                  <ToggleGroupItem value="week" className="text-sm px-4">
                    Semaine
                  </ToggleGroupItem>
                  <ToggleGroupItem value="month" className="text-sm px-4">
                    Mois
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">Revenus {getPeriodLabel()}</span>
                      <TrendingUp className="w-5 h-5 opacity-90" />
                    </div>
                    <div className="text-3xl font-bold">
                      {liveRevenue.toLocaleString('fr-FR')} FCFA
                    </div>
                    <p className="text-xs opacity-80 mt-1">Mis à jour en temps réel</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Commandes actives</span>
                      <ShoppingCart className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold">
                      {recentOrders.filter(o => o.status === 'in_progress' || o.status === 'pending').length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">en cours de traitement</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">PDV actifs {getPeriodLabel()}</span>
                      <Building2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold">
                      {activeRestaurants}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">points de vente avec commandes</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Commandes en temps réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune commande récente</p>
                      </div>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(order.status)}`}></div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">{order.customer_name}</p>
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {order.restaurant_name}
                                </Badge>
                                {order.table_number && (
                                  <Badge variant="outline" className="text-xs">
                                    Table {order.table_number}
                                  </Badge>
                                )}
                                {order.order_type && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {order.order_type}
                                  </Badge>
                                )}
                              </div>
                              {order.restaurant_address && (
                                <p className="text-xs text-muted-foreground">{order.restaurant_address}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-lg">{order.total_amount.toLocaleString('fr-FR')} FCFA</p>
                            <Badge variant="outline" className="capitalize text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Sales by Outlet */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Ventes journalières par PDV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {outletSales.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune vente aujourd'hui</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {outletSales.map((outlet, index) => (
                        <div key={outlet.outlet_id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-lg">{outlet.outlet_name}</p>
                            {outlet.outlet_address && (
                              <p className="text-xs text-muted-foreground">{outlet.outlet_address}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {outlet.order_count} commande{outlet.order_count > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {outlet.daily_revenue.toLocaleString('fr-FR')}
                            </p>
                            <p className="text-xs text-muted-foreground">FCFA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buttons" className="mt-6">
              <ButtonUsageStats />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminRealTime;
