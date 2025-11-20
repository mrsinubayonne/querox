import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Search, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Shield
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Restaurant {
  id: string;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_status: string | null;
  created_at: string;
}

const RestaurantsManagementPanel: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les restaurants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string | null, subscribed: boolean) => {
    if (!subscribed || !status) {
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">Inactif</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Actif</Badge>;
      case 'trial':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Essai</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return null;
    
    const colors: { [key: string]: string } = {
      'starter': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'premium': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'pro': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'entreprise': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    
    return <Badge variant="outline" className={colors[tier.toLowerCase()] || ''}>{tier}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Gestion des Restaurants</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Rechercher un restaurant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <Building2 className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredRestaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id}
                    className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-purple-500/20 rounded-lg">
                            <Building2 className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="font-semibold text-white">{restaurant.email}</span>
                          {getStatusBadge(restaurant.subscription_status, restaurant.subscribed)}
                          {getTierBadge(restaurant.subscription_tier)}
                        </div>
                        <div className="text-sm text-slate-400">
                          Inscrit le {new Date(restaurant.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantsManagementPanel;
