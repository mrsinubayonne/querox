
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GrantSubscriptionParams {
  email: string;
  tier: 'starter' | 'premium' | 'pro';
  durationDays: number;
}

export const useAdminSubscription = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const grantSubscription = async ({ email, tier, durationDays }: GrantSubscriptionParams) => {
    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      // Chercher d'abord l'utilisateur par email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Créer ou mettre à jour l'abonnement
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user?.id || null,
          email: email,
          subscription_tier: tier,
          subscribed: true,
          subscription_end: endDate.toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Abonnement ${tier} accordé à ${email} pour ${durationDays} jours`,
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'attribution de l\'abonnement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accorder l'abonnement",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const revokeSubscription = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          subscribed: false,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Abonnement révoqué pour ${email}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de révoquer l'abonnement",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const extendSubscription = async (email: string, additionalDays: number) => {
    setLoading(true);
    try {
      // Récupérer l'abonnement actuel
      const { data: subscription, error: fetchError } = await supabase
        .from('subscribers')
        .select('subscription_end')
        .eq('email', email)
        .single();

      if (fetchError) throw fetchError;

      const currentEnd = subscription.subscription_end 
        ? new Date(subscription.subscription_end)
        : new Date();
      
      currentEnd.setDate(currentEnd.getDate() + additionalDays);

      const { error } = await supabase
        .from('subscribers')
        .update({
          subscription_end: currentEnd.toISOString(),
          subscribed: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Abonnement prolongé de ${additionalDays} jours pour ${email}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la prolongation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de prolonger l'abonnement",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    grantSubscription,
    revokeSubscription,
    extendSubscription,
    loading
  };
};
