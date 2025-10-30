
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
      // Chercher d'abord par user_id, puis par email
      let { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data && !error) {
        const { data: emailData, error: emailError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        
        data = emailData;
        error = emailError;
        
        if (data && !data.user_id) {
          await supabase
            .from('subscribers')
            .update({ user_id: user.id })
            .eq('id', data.id);
          
          data.user_id = user.id;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur récupération abonnement:', error);
      }

      setSubscription(data);
    } catch (error) {
      console.error('Erreur fetchSubscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user, isAdminUser]);

  // Fetch initial data
  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Separate effect for realtime subscription
  useEffect(() => {
    if (!user?.id || userRole?.role === 'admin') return;

    // Subscribe to realtime changes for non-admins
    const channel = supabase
      .channel(`subscription-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, userRole?.role, fetchSubscription]);


  const isSubscriptionActive = useCallback(() => {
    if (userRole?.role === 'admin') {
      return true;
    }
    
    if (!subscription) {
      return false;
    }
    
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
    loading,
    isSubscriptionActive: isSubscriptionActive(),
    daysRemaining: getDaysRemaining(),
    refetch: fetchSubscription,
    isAdmin: userRole?.role === 'admin',
  };
};
