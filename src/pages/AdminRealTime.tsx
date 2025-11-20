import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Activity, ShoppingCart, Building2, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface RealtimeOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id?: string;
  restaurant_name?: string;
}

const AdminRealTime: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RealtimeOrder[]>([]);
  const [liveRevenue, setLiveRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

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
  }, [isAdmin]);

  const fetchRealtimeData = async () => {
    try {
      setLoading(true);
      
      // Get last 20 orders with outlet information
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id, 
          customer_name, 
          total_amount, 
          status, 
          created_at, 
          user_id,
          outlet_id,
          outlets (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Map orders with outlet name
      const ordersWithOutletName = orders?.map(order => ({
        ...order,
        restaurant_name: (order as any).outlets?.name || 'PDV inconnu'
      })) || [];

      // Calculate live revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRevenue = ordersWithOutletName
        .filter(o => new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      setLiveRevenue(todayRevenue);
      setRecentOrders(ordersWithOutletName);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données temps réel');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = (newOrder: RealtimeOrder) => {
    setRecentOrders(prev => [newOrder, ...prev].slice(0, 20));
    setLiveRevenue(prev => prev + (newOrder.total_amount || 0));
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

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Revenus du jour</span>
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
                  <span className="text-sm font-medium text-muted-foreground">Restaurants actifs</span>
                  <Building2 className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold">
                  {new Set(recentOrders.map(o => o.user_id)).size}
                </div>
                <p className="text-xs text-muted-foreground mt-1">ont des commandes</p>
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
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border animate-fade-in">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{order.customer_name}</p>
                            <Badge variant="secondary" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {order.restaurant_name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{order.total_amount.toLocaleString('fr-FR')} FCFA</p>
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

          {/* Top Performing Restaurants */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top 10 Restaurants du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Données en cours de collecte...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRealTime;
