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
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">Revenus du Jour</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(todayRevenue)} FCFA
            </p>
            <p className="text-xs text-slate-500">Mis à jour en temps réel</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">Commandes Aujourd'hui</p>
            <p className="text-3xl font-bold text-white">{liveOrders.length}</p>
            <p className="text-xs text-slate-500">Dernières 24h</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">Trafic</p>
            <p className="text-3xl font-bold text-white">{trafficPeak}</p>
            <p className="text-xs text-slate-500">commandes/jour</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400">Panier Moyen</p>
            <p className="text-3xl font-bold text-white">
              {liveOrders.length > 0 
                ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(todayRevenue / liveOrders.length)
                : 0
              } FCFA
            </p>
            <p className="text-xs text-slate-500">Par commande</p>
          </div>
        </div>
      </div>

      {/* Live orders feed */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-white">Flux de Commandes en Temps Réel</h3>
        </div>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {liveOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-slate-800/50 rounded-xl w-fit mx-auto mb-4">
                  <Clock className="w-12 h-12 text-slate-600" />
                </div>
                <p className="text-slate-400">Aucune commande récente</p>
              </div>
            ) : (
              liveOrders.map((order) => (
                <div 
                  key={order.id}
                  className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                          <ShoppingCart className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-semibold text-white">{order.customer_name}</span>
                        <Badge className={`${getStatusColor(order.status)} text-xs border`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="font-semibold text-green-400">
                          {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(order.total_amount))} FCFA
                        </span>
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
      </div>
    </div>
  );
};

export default LiveActivityPanel;
