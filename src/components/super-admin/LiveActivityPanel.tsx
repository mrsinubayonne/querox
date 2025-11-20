import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  TrendingUp, 
  Activity, 
  Award,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LiveOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const LiveActivityPanel: React.FC = () => {
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [trafficPeak, setTrafficPeak] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchLiveData();
    
    // Subscribe to real-time orders
    const channel = supabase
      .channel('live-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('New order event:', payload);
          fetchLiveData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLiveData = async () => {
    try {
      // Fetch recent orders (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setLiveOrders(orders || []);

      // Calculate today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders?.filter(order => 
        new Date(order.created_at) >= today
      ) || [];

      const revenue = todayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
      setTodayRevenue(revenue);

      // Calculate traffic (orders per hour)
      setTrafficPeak(todayOrders.length);

    } catch (error: any) {
      console.error('Error fetching live data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données en temps réel",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'delivered': 'Livré',
      'in_progress': 'En cours',
      'pending': 'En attente',
      'cancelled': 'Annulé',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Revenus du Jour</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(todayRevenue)} FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mis à jour en temps réel</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Commandes Aujourd'hui</span>
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-foreground">{liveOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Dernières 24h</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Trafic</span>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-foreground">{trafficPeak}</div>
            <p className="text-xs text-muted-foreground mt-1">commandes/jour</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Panier Moyen</span>
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {liveOrders.length > 0 
                ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(todayRevenue / liveOrders.length)
                : 0
              } FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">Par commande</p>
          </CardContent>
        </Card>
      </div>

      {/* Live orders feed */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            Flux de Commandes en Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {liveOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune commande récente</p>
                </div>
              ) : (
                liveOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">{order.customer_name}</span>
                          <Badge className={`${getStatusColor(order.status)} text-xs border`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(order.total_amount))} FCFA</span>
                          <span>•</span>
                          <span>{new Date(order.created_at).toLocaleString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: 'short'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveActivityPanel;
