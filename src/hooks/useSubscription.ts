
import { useState, useEffect, useCallback, useRef } from 'react';
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

interface CachedSubscription extends Subscription {
  cached_at: number;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (reduced for faster sync)

const getSubscriptionCacheKey = (userId: string) => `subscription_cache_${userId}`;

const getCachedSubscription = (userId: string): Subscription | null => {
  try {
    const cached = localStorage.getItem(getSubscriptionCacheKey(userId));
    if (!cached) return null;
    
    const data: CachedSubscription = JSON.parse(cached);
    const age = Date.now() - data.cached_at;
    
    // Vérifier que le cache n'est pas expiré
    if (age > CACHE_DURATION) {
      localStorage.removeItem(getSubscriptionCacheKey(userId));
      return null;
    }
    
    // Vérifier que l'abonnement n'est pas expiré
    if (data.subscription_end) {
      const endDate = new Date(data.subscription_end);
      if (endDate < new Date()) {
        localStorage.removeItem(getSubscriptionCacheKey(userId));
        return null;
      }
    }
    
    const { cached_at, ...subscription } = data;
    return subscription;
  } catch (error) {
    console.error('Error reading subscription cache:', error);
    return null;
  }
};

const setCachedSubscription = (userId: string, subscription: Subscription | null) => {
  try {
    if (!subscription) {
      localStorage.removeItem(getSubscriptionCacheKey(userId));
      return;
    }
    
    const cached: CachedSubscription = {
      ...subscription,
      cached_at: Date.now()
    };
    
    localStorage.setItem(getSubscriptionCacheKey(userId), JSON.stringify(cached));
  } catch (error) {
    console.error('Error caching subscription:', error);
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRole, setLoadingRole] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);

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


  // Use a ref to avoid subscription in useCallback deps (prevents infinite loop)
  const subscriptionRef = useRef<Subscription | null>(null);
  subscriptionRef.current = subscription;

  const fetchSubscription = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      setCachedSubscription('', null);
      return;
    }

    // Set loading true at the START of refetch to trigger grace period in guard
    setLoading(true);
    
    console.log('🔍 Fetching subscription for user:', user.id, user.email, { forceRefresh });

    // If not force refresh, check cache first
    if (!forceRefresh) {
      const cached = getCachedSubscription(user.id);
      if (cached) {
        console.log('📦 Using cached subscription:', { 
          tier: cached.subscription_tier, 
          status: cached.subscription_status 
        });
        setSubscription(cached);
        setHasCachedData(true);
        setLoading(false);
        return;
      }
    } else {
      console.log('🔄 Force refresh: ignoring cache');
    }

    const isAdmin = await isAdminUser();
    
    if (isAdmin) {
      console.log('👑 User is admin, granting full access');
      const adminSubscription = {
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
      };
      setSubscription(adminSubscription);
      setCachedSubscription(user.id, adminSubscription);
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
            console.log('🔗 Linked user_id to subscriber record');
          } catch (linkErr) {
            console.warn('Impossible de lier user_id au subscriber:', linkErr);
          }
        }
      }

      if (userErr && userErr.code !== 'PGRST116') {
        console.error('Erreur récupération abonnement (user_id):', userErr);
      }

      if (record) {
        console.log('✅ Abonnement trouvé:', { 
          tier: record.subscription_tier, 
          status: record.subscription_status,
          subscribed: record.subscribed,
          end: record.subscription_end,
          userId: user.id,
          email: user.email
        });
        setSubscription(record);
        setCachedSubscription(user.id, record);
        setHasCachedData(true);
      } else {
        console.warn('⚠️ Aucun abonnement trouvé pour:', { userId: user.id, email: user.email });
        setSubscription(null);
        // Don't cache null - allow retry on next check
      }
    } catch (error) {
      console.error('Erreur fetchSubscription:', error);
      // Don't clear subscription on error - keep last known good state
      if (!subscriptionRef.current) {
        setSubscription(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAdminUser]);

  // Charger le cache au montage
  useEffect(() => {
    if (user) {
      const cached = getCachedSubscription(user.id);
      if (cached) {
        console.log('📦 Cache abonnement trouvé:', { 
          tier: cached.subscription_tier, 
          status: cached.subscription_status 
        });
        setSubscription(cached);
        setHasCachedData(true);
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole, user]);

  useEffect(() => {
    fetchSubscription();

    // Rafraîchir les données toutes les 30 secondes (suffit pour tous les rôles)
    if (user) {
      const interval = setInterval(fetchSubscription, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchSubscription, user]);


  const isSubscriptionActive = useCallback(() => {
    // Admin bypass
    if (userRole?.role === 'admin') {
      return true;
    }
    
    if (!subscription) {
      return false;
    }
    
    // CRITICAL: TOUJOURS vérifier la date d'expiration en premier
    if (subscription.subscription_end) {
      const endDate = new Date(subscription.subscription_end);
      const now = new Date();
      
      if (endDate <= now) {
        console.log('❌ Abonnement EXPIRÉ:', {
          email: subscription.email,
          endDate: subscription.subscription_end,
          now: now.toISOString()
        });
        return false; // EXPIRÉ - bloquer l'accès
      }
    }
    
    // Si pas expiré, vérifier le statut
    if (subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing') {
      return true;
    }
    
    // Statuts inactifs
    if (subscription.subscription_status === 'cancelled' || 
        subscription.subscription_status === 'expired' ||
        subscription.subscription_status === 'past_due') {
      console.log('❌ Statut abonnement inactif:', subscription.subscription_status);
      return false;
    }
    
    // Fallback pour les anciennes lignes sans status
    if (!subscription.subscribed) {
      return false;
    }
    
    // Si subscribed=true et pas de date de fin, c'est actif (permanent)
    return true;
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
    hasCachedData,
  };
};
