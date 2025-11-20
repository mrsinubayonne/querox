import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminAlert {
  id: string;
  type: 'payment_failure' | 'suspension' | 'trial_ending' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  restaurant_id?: string;
  restaurant_name?: string;
  created_at: string;
  resolved: boolean;
}

export const useAdminAlerts = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Fetch subscribers with issues
      const { data: subscribers, error: subsError } = await supabase
        .from('subscribers')
        .select('user_id, email, subscription_status, subscription_end, subscription_tier')
        .in('subscription_status', ['canceled', 'past_due']);

      if (subsError) throw subsError;

      // Fetch outlets to get restaurant names
      const { data: outlets } = await supabase
        .from('outlets')
        .select('id, name, user_id');

      const generatedAlerts: AdminAlert[] = [];

      subscribers?.forEach((sub) => {
        const outlet = outlets?.find(o => o.user_id === sub.user_id);
        
        if (sub.subscription_status === 'past_due') {
          generatedAlerts.push({
            id: `payment-${sub.user_id}`,
            type: 'payment_failure',
            severity: 'critical',
            title: 'Échec de paiement',
            message: `Échec de paiement pour ${outlet?.name || sub.email}`,
            restaurant_id: outlet?.id,
            restaurant_name: outlet?.name || sub.email,
            created_at: new Date().toISOString(),
            resolved: false
          });
        }

        if (sub.subscription_status === 'canceled') {
          generatedAlerts.push({
            id: `suspension-${sub.user_id}`,
            type: 'suspension',
            severity: 'critical',
            title: 'Abonnement annulé',
            message: `L'abonnement de ${outlet?.name || sub.email} a été annulé`,
            restaurant_id: outlet?.id,
            restaurant_name: outlet?.name || sub.email,
            created_at: new Date().toISOString(),
            resolved: false
          });
        }

        // Check trial ending (within 3 days)
        if (sub.subscription_end) {
          const endDate = new Date(sub.subscription_end);
          const now = new Date();
          const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilEnd <= 3 && daysUntilEnd > 0) {
            generatedAlerts.push({
              id: `trial-${sub.user_id}`,
              type: 'trial_ending',
              severity: 'warning',
              title: "Période d'essai se termine",
              message: `L'essai de ${outlet?.name || sub.email} expire dans ${daysUntilEnd} jour(s)`,
              restaurant_id: outlet?.id,
              restaurant_name: outlet?.name || sub.email,
              created_at: new Date().toISOString(),
              resolved: false
            });
          }
        }
      });

      setAlerts(generatedAlerts);
    } catch (error: any) {
      console.error('Erreur lors du chargement des alertes:', error);
      toast.error('Impossible de charger les alertes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    refetch: fetchAlerts
  };
};
