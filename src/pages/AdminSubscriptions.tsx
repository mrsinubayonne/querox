
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Calendar, Crown, AlertTriangle, RefreshCw } from 'lucide-react';
import ModernSidebar from '@/components/ModernSidebar';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import SubscriptionForm from '@/components/admin/SubscriptionForm';
import SubscriptionsList from '@/components/admin/SubscriptionsList';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

interface Subscription {
  id: string;
  user_id: string;
  email: string;
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

const ADMIN_EMAILS = [
  'emmanuelhussinbayonne@gmail.com',
  'bayonnecastadorkhloe@gmail.com', 
  'mrsinulion@gmail.com'
];

const AdminSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSubscriptions, setFetchingSubscriptions] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthorization();
  }, [user]);

  useEffect(() => {
    if (isAuthorized) {
      fetchSubscriptions();
    }
  }, [isAuthorized]);

  const checkAuthorization = () => {
    console.log('🔍 AdminSubscriptions - Vérification des autorisations');
    console.log('🔍 Utilisateur actuel:', user?.email);
    console.log('🔍 Emails admin autorisés:', ADMIN_EMAILS);
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      setLoading(false);
      return;
    }

    if (ADMIN_EMAILS.includes(user.email || '')) {
      console.log('✅ Utilisateur autorisé comme admin');
      setIsAuthorized(true);
    } else {
      console.log('❌ Utilisateur non autorisé');
      setIsAuthorized(false);
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas l'autorisation d'accéder à cette interface",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const fetchSubscriptions = async () => {
    console.log('🔄 AdminSubscriptions - Début du chargement des abonnements');
    setFetchingSubscriptions(true);
    setError(null);
    
    try {
      console.log('📡 Requête vers la table subscribers...');
      
      const { data, error, count } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('📊 Résultat de la requête:', {
        data: data,
        error: error,
        count: count,
        dataLength: data?.length
      });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ Abonnements récupérés avec succès:', data?.length || 0);
      setSubscriptions(data || []);
      
      if (data && data.length === 0) {
        console.log('ℹ️ Aucun abonnement trouvé dans la base de données');
      }
      
    } catch (error: any) {
      console.error('💥 Erreur lors du chargement des abonnements:', error);
      setError(error.message || 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: `Impossible de charger les abonnements: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setFetchingSubscriptions(false);
    }
  };

  const handleRefreshSubscriptions = () => {
    console.log('🔄 Rafraîchissement manuel des abonnements');
    fetchSubscriptions();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Vérification des autorisations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <AdminHeader userEmail={user?.email} />
          
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-red-800 font-medium">Erreur de chargement</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    <Button 
                      onClick={handleRefreshSubscriptions}
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      disabled={fetchingSubscriptions}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${fetchingSubscriptions ? 'animate-spin' : ''}`} />
                      Réessayer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <SubscriptionForm 
            onSubscriptionCreated={fetchSubscriptions}
          />

          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Abonnements</h2>
              {fetchingSubscriptions && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
            </div>
            <Button 
              onClick={handleRefreshSubscriptions}
              variant="outline" 
              size="sm"
              disabled={fetchingSubscriptions}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${fetchingSubscriptions ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          <SubscriptionsList 
            subscriptions={subscriptions}
            onSubscriptionUpdated={fetchSubscriptions}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
