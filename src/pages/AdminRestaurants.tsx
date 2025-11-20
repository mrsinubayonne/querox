import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Building2, Search, MoreVertical, Power, PowerOff, Edit, FileText, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  user_id: string;
  created_at: string;
  subscription_status?: string;
  subscription_tier?: string;
  total_orders?: number;
  total_revenue?: number;
}

const AdminRestaurants: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchRestaurants();
    }
  }, [isAdmin]);

  useEffect(() => {
    let filtered = restaurants;
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.subscription_status === statusFilter);
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      // Fetch outlets
      const { data: outlets, error: outletsError } = await supabase
        .from('outlets')
        .select('*')
        .order('created_at', { ascending: false });

      if (outletsError) throw outletsError;

      // Fetch subscriptions
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('user_id, subscription_status, subscription_tier');

      // Fetch orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total_amount');

      // Combine data
      const restaurantsWithData = outlets?.map(outlet => {
        const subscription = subscribers?.find(s => s.user_id === outlet.user_id);
        const userOrders = orders?.filter(o => o.user_id === outlet.user_id) || [];
        
        return {
          ...outlet,
          subscription_status: subscription?.subscription_status || 'inactive',
          subscription_tier: subscription?.subscription_tier || 'free',
          total_orders: userOrders.length,
          total_revenue: userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        };
      }) || [];

      setRestaurants(restaurantsWithData);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des restaurants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Actif', variant: 'default' as const, icon: CheckCircle },
      suspended: { label: 'Suspendu', variant: 'destructive' as const, icon: XCircle },
      trial: { label: 'Essai', variant: 'secondary' as const, icon: Clock },
      inactive: { label: 'Inactif', variant: 'outline' as const, icon: AlertTriangle }
    };
    
    const config = configs[status as keyof typeof configs] || configs.inactive;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Restaurants</h1>
              <p className="text-sm text-muted-foreground">Contrôlez tous les établissements de la plateforme</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-bold">{restaurants.length}</div>
                <p className="text-xs text-muted-foreground mt-1">restaurants</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Actifs</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-3xl font-bold">
                  {restaurants.filter(r => r.subscription_status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">en activité</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Essai</span>
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-3xl font-bold">
                  {restaurants.filter(r => r.subscription_status === 'trial').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">en période d'essai</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Suspendus</span>
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-3xl font-bold">
                  {restaurants.filter(r => r.subscription_status === 'suspended').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">suspendus</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="trial">Essai</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Restaurants List */}
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                          {getStatusBadge(restaurant.subscription_status || 'inactive')}
                          <Badge variant="outline" className="capitalize">
                            {restaurant.subscription_tier || 'free'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{restaurant.address || 'Adresse non renseignée'}</p>
                        <p className="text-sm text-muted-foreground">{restaurant.phone || 'Téléphone non renseigné'}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            <strong>{restaurant.total_orders || 0}</strong> commandes
                          </span>
                          <span className="text-xs text-muted-foreground">
                            <strong>{new Intl.NumberFormat('fr-FR').format(restaurant.total_revenue || 0)} FCFA</strong> de CA
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Créé le {new Date(restaurant.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Power className="w-4 h-4 mr-2" />
                          Activer/Désactiver
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <PowerOff className="w-4 h-4 mr-2" />
                          Suspendre
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRestaurants.length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun restaurant trouvé</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurants;
