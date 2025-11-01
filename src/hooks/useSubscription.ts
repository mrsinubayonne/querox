
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
  subscription_start: string | null;
  monthly_revenue: number;
  last_payment_date: string | null;
  subscription_status: string;
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
  const [loadingRole, setLoadingRole] = useState(true);

  // Check if current user is admin using the new role system
  const isAdminUser = useCallback(async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      console.error('Error in isAdminUser:', error);
      return false;
    }
  }, [user]);

  const fetchUserRole = useCallback(async () => {
    if (!user) {
      setUserRole(null);
      setLoadingRole(false);
      return;
    }

    setLoadingRole(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } else {
        setUserRole(Array.isArray(data) && data.length > 0 ? (data[0] as UserRole) : null);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole(null);
    } finally {
      setLoadingRole(false);
    }
  }, [user]);


  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const isAdmin = await isAdminUser();
    
    if (isAdmin) {
      setSubscription({
        id: 'admin-override',
        user_id: user.id,
        email: user.email || '',
        subscribed: true,
        subscription_tier: 'admin',
        subscription_end: null,
        stripe_customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subscription_start: new Date().toISOString(),
        monthly_revenue: 0,
        last_payment_date: null,
        subscription_status: 'active'
      });
      setLoading(false);
      return;
    }

    try {
      // Chercher d'abord par user_id (évite les erreurs 406 en cas de doublons)
      const { data: byUser, error: userErr } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      let record = (byUser && byUser.length > 0) ? byUser[0] : null;

      // Si rien par user_id, tenter par email (même logique, sans 406)
      if (!record) {
        const { data: byEmail, error: emailErr } = await supabase
          .from('subscribers')
          .select('*')
          .eq('email', user.email)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (emailErr && emailErr.code !== 'PGRST116') {
          console.error('Erreur récupération abonnement (email):', emailErr);
        }

        record = (byEmail && byEmail.length > 0) ? byEmail[0] : null;

        // Si trouvé par email mais sans user_id, lier le compte
        if (record && !record.user_id) {
          try {
            await supabase
              .from('subscribers')
              .update({ user_id: user.id })
              .eq('id', record.id);
            record.user_id = user.id;
          } catch (linkErr) {
            console.warn('Impossible de lier user_id au subscriber:', linkErr);
          }
        }
      }

      if (userErr && userErr.code !== 'PGRST116') {
        console.error('Erreur récupération abonnement (user_id):', userErr);
      }

      setSubscription(record);
    } catch (error) {
      console.error('Erreur fetchSubscription:', error);
      setSubscription(null);
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


  const isSubscriptionActive = useCallback(() => {
    if (userRole?.role === 'admin') {
      return true;
    }
    
    if (!subscription) {
      return false;
    }
    
    // If status says active, trust it
    if (subscription.subscription_status === 'active') {
      return true;
    }
    
    // Fallbacks for legacy rows
    if (!subscription.subscribed) {
      return false;
    }
    
    if (!subscription.subscription_end) {
      return true;
    }
    
    const endDate = new Date(subscription.subscription_end);
    const now = new Date();
    return endDate > now;
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
    loading: loading || loadingRole,
    isSubscriptionActive: isSubscriptionActive(),
    daysRemaining: getDaysRemaining(),
    refetch: fetchSubscription,
    isAdmin: userRole?.role === 'admin',
  };
};
