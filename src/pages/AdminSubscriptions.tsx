import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ModernSidebar from '@/components/ModernSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
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

const AdminSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [fetchingSubscriptions, setFetchingSubscriptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isAdmin) {
      fetchSubscriptions();
    }
  }, [isAdmin]);

  const fetchSubscriptions = async () => {
    setFetchingSubscriptions(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSubscriptions(data || []);
      
    } catch (error: any) {
      setError(error.message || 'Erreur inconnue');
      toast.error("Erreur", { description: `Impossible de charger les abonnements: ${error.message}` });
    } finally {
      setFetchingSubscriptions(false);
    }
  };

  const handleRefreshSubscriptions = () => {
    fetchSubscriptions();
  };

  if (authLoading) {
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

  if (!isAdmin) {
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
