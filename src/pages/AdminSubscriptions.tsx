
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Calendar, Crown, AlertTriangle } from 'lucide-react';
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
  const [isAuthorized, setIsAuthorized] = useState(false);
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
    if (!user) {
      setLoading(false);
      return;
    }

    if (ADMIN_EMAILS.includes(user.email || '')) {
      setIsAuthorized(true);
    } else {
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
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les abonnements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          
          <SubscriptionForm 
            onSubscriptionCreated={fetchSubscriptions}
          />

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
