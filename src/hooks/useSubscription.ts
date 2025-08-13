
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
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin using the new role system
  const isAdminUser = useCallback(async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isAdminUser:', error);
      return false;
    }
  }, [user]);

  const fetchUserRole = useCallback(async () => {
    if (!user) {
      setUserRole(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  }, [user]);

  const createTrialSubscription = async (userEmail: string, userId: string) => {
    try {
      console.log('🆕 Création d\'un abonnement d\'essai de 7 jours pour:', userEmail);
      
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 jours d'essai

      const { data, error } = await supabase
        .from('subscribers')
        .insert({
          user_id: userId,
          email: userEmail,
          subscribed: true,
          subscription_tier: 'trial',
          subscription_end: trialEndDate.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de l\'abonnement d\'essai:', error);
        return null;
      }

      console.log('✅ Abonnement d\'essai créé avec succès:', data);
      return data;
    } catch (error) {
      console.error('💥 Erreur dans createTrialSubscription:', error);
      return null;
    }
  };

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Check if user is admin first
    const isAdmin = await isAdminUser();
    
    if (isAdmin) {
      console.log('✅ Utilisateur admin détecté - configuration immédiate');
      setSubscription({
        id: 'admin-override',
        user_id: user.id,
        email: user.email || '',
        subscribed: true,
        subscription_tier: 'admin',
        subscription_end: null,
        stripe_customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Récupération des données d\'abonnement pour:', user.email);
      
      // Chercher d'abord par user_id, puis par email
      let { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Si pas trouvé par user_id, chercher par email
      if (!data && !error) {
        console.log('📧 Recherche par email:', user.email);
        const { data: emailData, error: emailError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        
        data = emailData;
        error = emailError;
        
        // Si trouvé par email mais pas de user_id, mettre à jour le user_id
        if (data && !data.user_id) {
          console.log('📝 Mise à jour du user_id pour l\'abonnement trouvé par email');
          await supabase
            .from('subscribers')
            .update({ user_id: user.id })
            .eq('id', data.id);
          
          data.user_id = user.id;
        }
      }

      // Si aucun abonnement trouvé, créer un essai gratuit de 7 jours
      if (!data && !error) {
        console.log('🎁 Aucun abonnement trouvé - création d\'un essai gratuit de 7 jours');
        data = await createTrialSubscription(user.email || '', user.id);
        
        // Si la création d'essai a échoué, créer un état d'essai local temporaire
        if (!data) {
          console.log('⚠️ Échec de création d\'essai en base - création d\'un état temporaire');
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 7);
          
          data = {
            id: 'temp-trial-' + user.id,
            user_id: user.id,
            email: user.email || '',
            subscribed: true,
            subscription_tier: 'trial',
            subscription_end: trialEndDate.toISOString(),
            stripe_customer_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la récupération de l\'abonnement:', error);
        // En cas d'erreur, créer quand même un essai temporaire
        console.log('🆘 Création d\'un essai temporaire en cas d\'erreur');
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        data = {
          id: 'temp-trial-error-' + user.id,
          user_id: user.id,
          email: user.email || '',
          subscribed: true,
          subscription_tier: 'trial',
          subscription_end: trialEndDate.toISOString(),
          stripe_customer_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      console.log('✅ Données d\'abonnement final:', data);
      setSubscription(data);
    } catch (error) {
      console.error('💥 Erreur dans fetchSubscription:', error);
      // En cas d'erreur critique, créer un essai temporaire
      console.log('🚨 Création d\'un essai d\'urgence après erreur critique');
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      
      setSubscription({
        id: 'emergency-trial-' + user.id,
        user_id: user.id,
        email: user.email || '',
        subscribed: true,
        subscription_tier: 'trial',
        subscription_end: trialEndDate.toISOString(),
        stripe_customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAdminUser]);

  useEffect(() => {
    fetchUserRole();
    fetchSubscription();
    
    if (user && userRole?.role !== 'admin') {
      // Rafraîchir les données toutes les 30 secondes seulement pour les non-admins
      const interval = setInterval(fetchSubscription, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchSubscription, fetchUserRole, user, userRole]);

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
    // Les administrateurs ont TOUJOURS accès
    if (userRole?.role === 'admin') {
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
  }, [subscription, userRole]);

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
    isAdmin: userRole?.role === 'admin',
  };
};
