
import { useState, useEffect, useCallback } from 'react';
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

const ADMIN_EMAILS = [
  'emmanuelhussinbayonne@gmail.com',
  'bayonnecastadorkhloe@gmail.com', 
  'mrsinulion@gmail.com'
];

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier immédiatement si l'utilisateur est admin
  const isAdminUser = useCallback(() => {
    const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');
    console.log('🔍 Vérification admin immédiate:', {
      email: user?.email,
      isAdmin,
      adminEmails: ADMIN_EMAILS
    });
    return isAdmin;
  }, [user]);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      console.log('❌ Pas d\'utilisateur connecté');
      setSubscription(null);
      setLoading(false);
      return;
    }

    console.log('🔄 fetchSubscription démarré pour:', {
      email: user.email,
      userId: user.id,
      isAdmin: isAdminUser()
    });

    // Si l'utilisateur est admin, on peut définir immédiatement un état valide
    if (isAdminUser()) {
      console.log('✅ Utilisateur admin détecté - configuration immédiate');
      setSubscription({
        id: 'admin-override',
        user_id: user.id,
        email: user.email || '',
        subscribed: true,
        subscription_tier: 'admin',
        subscription_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Récupération des données d\'abonnement pour utilisateur non-admin');
      
      // Stratégie améliorée : chercher d'abord par email (plus fiable)
      let { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      console.log('📧 Résultat recherche par email:', { data, error, email: user.email });

      // Si pas trouvé par email, chercher par user_id
      if (!data && !error) {
        console.log('🆔 Recherche par user_id:', user.id);
        const { data: userIdData, error: userIdError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        data = userIdData;
        error = userIdError;
        console.log('📊 Résultat recherche par user_id:', { data, error });
      }

      // Si trouvé mais pas de user_id, mettre à jour le user_id
      if (data && !data.user_id) {
        console.log('📝 Mise à jour du user_id pour l\'abonnement trouvé');
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ 
            user_id: user.id,
            updated_at: new Date().toISOString() 
          })
          .eq('id', data.id);
        
        if (!updateError) {
          data.user_id = user.id;
          console.log('✅ user_id mis à jour avec succès');
        } else {
          console.error('❌ Erreur lors de la mise à jour du user_id:', updateError);
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la récupération de l\'abonnement:', error);
        throw error;
      } else {
        console.log('✅ Données d\'abonnement récupérées:', data);
        setSubscription(data);
      }
    } catch (error) {
      console.error('💥 Erreur dans fetchSubscription:', error);
      // En cas d'erreur, on garde l'ancien état plutôt que de tout effacer
    } finally {
      setLoading(false);
    }
  }, [user, isAdminUser]);

  useEffect(() => {
    console.log('🔄 useEffect fetchSubscription déclenché');
    fetchSubscription();
    
    if (user && !isAdminUser()) {
      // Rafraîchir les données toutes les 30 secondes seulement pour les non-admins
      const interval = setInterval(() => {
        console.log('⏰ Rafraîchissement automatique des données d\'abonnement');
        fetchSubscription();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchSubscription, user, isAdminUser]);

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

  const isSubscriptionActive = useCallback(() => {
    console.log('🔍 isSubscriptionActive appelé avec:', {
      isAdmin: isAdminUser(),
      subscription,
      userEmail: user?.email
    });

    // Les administrateurs ont TOUJOURS accès
    if (isAdminUser()) {
      console.log('✅ Accès admin accordé immédiatement');
      return true;
    }
    
    if (!subscription) {
      console.log('❌ Pas d\'abonnement trouvé dans la base de données');
      return false;
    }
    
    console.log('📊 Vérification des détails de l\'abonnement:', {
      subscribed: subscription.subscribed,
      subscription_tier: subscription.subscription_tier,
      subscription_end: subscription.subscription_end,
      email: subscription.email,
      user_id: subscription.user_id
    });
    
    if (!subscription.subscribed) {
      console.log('❌ Abonnement marqué comme inactif (subscribed=false)');
      return false;
    }
    
    if (!subscription.subscription_end) {
      console.log('✅ Abonnement permanent actif (pas de date de fin)');
      return true;
    }
    
    const endDate = new Date(subscription.subscription_end);
    const now = new Date();
    const isActive = endDate > now;
    
    console.log('📅 Vérification de la date d\'expiration:', {
      endDate: endDate.toISOString(),
      now: now.toISOString(),
      isActive,
      daysRemaining: Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    return isActive;
  }, [subscription, isAdminUser, user]);

  const getDaysRemaining = () => {
    if (!subscription?.subscription_end) return null;
    
    const endDate = new Date(subscription.subscription_end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const result = {
    subscription,
    loading,
    createPayment,
    confirmPayment,
    isSubscriptionActive: isSubscriptionActive(),
    daysRemaining: getDaysRemaining(),
    refetch: fetchSubscription,
    isAdmin: isAdminUser(),
  };

  console.log('📤 useSubscription retourne:', {
    subscription: result.subscription,
    loading: result.loading,
    isSubscriptionActive: result.isSubscriptionActive,
    isAdmin: result.isAdmin
  });

  return result;
};
