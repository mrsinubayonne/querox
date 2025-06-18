
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  user_id: string | null;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations d'abonnement",
          variant: "destructive",
        });
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (tier: string, amount: number = 1000) => {
    if (!user) {
      console.log('❌ createPayment: Aucun utilisateur connecté');
      return null;
    }

    console.log('🔄 createPayment: Début de la création du paiement');
    console.log('📝 Paramètres:', { tier, amount, userId: user.id });

    try {
      setLoading(true);
      console.log('📡 Appel de la fonction edge create-subscription-payment...');

      const { data, error } = await supabase.functions.invoke('create-subscription-payment', {
        body: { tier, amount }
      });

      console.log('📨 Réponse de la fonction edge:', { data, error });

      if (error) {
        console.error('❌ Erreur de la fonction edge:', error);
        throw new Error(error.message);
      }

      console.log('✅ Paiement créé avec succès:', data);
      return data;
    } catch (error) {
      console.error('💥 Erreur dans createPayment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le paiement",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
      console.log('🏁 createPayment: Loading désactivé');
    }
  };

  const confirmPayment = async (orderId: string, status: 'success' | 'failure') => {
    try {
      const { error } = await supabase.functions.invoke('confirm-payment', {
        body: { order_id: orderId, status }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Recharger les données d'abonnement
      await fetchSubscription();

      toast({
        title: status === 'success' ? "Succès" : "Échec",
        description: status === 'success' 
          ? "Votre abonnement a été activé avec succès !"
          : "Le paiement a échoué. Veuillez réessayer.",
        variant: status === 'success' ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer le paiement",
        variant: "destructive",
      });
    }
  };

  const isSubscriptionActive = () => {
    if (!subscription || !subscription.subscribed) return false;
    if (!subscription.subscription_end) return true;
    
    return new Date(subscription.subscription_end) > new Date();
  };

  const getDaysRemaining = () => {
    if (!subscription?.subscription_end) return null;
    
    const endDate = new Date(subscription.subscription_end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return {
    subscription,
    loading,
    createPayment,
    confirmPayment,
    isSubscriptionActive: isSubscriptionActive(),
    daysRemaining: getDaysRemaining(),
    refetch: fetchSubscription,
  };
};
