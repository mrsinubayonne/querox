import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

// ── Cache TTL: 10 minutes ──────────────────────────────────────────────
const CACHE_DURATION = 10 * 60 * 1000;

const getSubscriptionCacheKey = (userId: string) => `subscription_cache_${userId}`;

const getCachedSubscription = (userId: string): Subscription | null => {
  try {
    const cached = localStorage.getItem(getSubscriptionCacheKey(userId));
    if (!cached) return null;
    
    const data: CachedSubscription = JSON.parse(cached);
    const age = Date.now() - data.cached_at;
    
    if (age > CACHE_DURATION) {
      localStorage.removeItem(getSubscriptionCacheKey(userId));
      return null;
    }
    
    if (data.subscription_end) {
      const endDate = new Date(data.subscription_end);
      if (endDate < new Date()) {
        localStorage.removeItem(getSubscriptionCacheKey(userId));
        return null;
      }
    }
    
    const { cached_at, ...subscription } = data;
    return subscription;
  } catch {
    return null;
  }
};

const setCachedSubscription = (userId: string, subscription: Subscription | null) => {
  try {
    if (!subscription) {
      localStorage.removeItem(getSubscriptionCacheKey(userId));
      return;
    }
    const cached: CachedSubscription = { ...subscription, cached_at: Date.now() };
    localStorage.setItem(getSubscriptionCacheKey(userId), JSON.stringify(cached));
  } catch {
    // ignore
  }
};

// ── Singleton fetch lock ───────────────────────────────────────────────
let _fetchInProgress: Promise<void> | null = null;

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRole, setLoadingRole] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);

  // Stable refs to avoid re-render cascades
  const userIdRef = useRef<string | undefined>();
  userIdRef.current = user?.id;
  const subscriptionRef = useRef<Subscription | null>(null);
  subscriptionRef.current = subscription;

  // ── Admin check (stable, no state) ─────────────────────────────────
  const isAdminUser = useCallback(async (uid: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', uid)
        .eq('role', 'admin')
        .limit(1);
      if (error) return false;
      return Array.isArray(data) && data.length > 0;
    } catch {
      return false;
    }
  }, []);

  // ── Fetch user role (once) ─────────────────────────────────────────
  const fetchUserRole = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) { setUserRole(null); setLoadingRole(false); return; }
    setLoadingRole(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (error && error.code !== 'PGRST116') { setUserRole(null); }
      else { setUserRole(Array.isArray(data) && data.length > 0 ? (data[0] as UserRole) : null); }
    } catch { setUserRole(null); }
    finally { setLoadingRole(false); }
  }, []); // no deps – uses ref

  // ── Core fetch (with lock + cache) ─────────────────────────────────
  const fetchSubscription = useCallback(async (forceRefresh = false) => {
    const uid = userIdRef.current;
    if (!uid) { setSubscription(null); setLoading(false); return; }

    // 1) If not forced, return cache immediately (NO state churn)
    if (!forceRefresh) {
      const cached = getCachedSubscription(uid);
      if (cached) {
        // Only update state if it actually changed
        if (subscriptionRef.current?.id !== cached.id || 
            subscriptionRef.current?.subscription_status !== cached.subscription_status) {
          setSubscription(cached);
        }
        setHasCachedData(true);
        setLoading(false);
        return;
      }
    }

    // 2) Anti-double-fetch lock
    if (_fetchInProgress) {
      await _fetchInProgress;
      return;
    }

    setLoading(true);

    const doFetch = async () => {
      const isAdmin = await isAdminUser(uid);

      if (isAdmin) {
        const adminSub: Subscription = {
          id: 'admin-override',
          user_id: uid,
          email: user?.email || '',
          subscribed: true,
          subscription_tier: 'admin',
          subscription_end: null,
          stripe_customer_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subscription_start: new Date().toISOString(),
          monthly_revenue: 0,
          last_payment_date: null,
          subscription_status: 'active',
        };
        setSubscription(adminSub);
        setCachedSubscription(uid, adminSub);
        setHasCachedData(true);
        setLoading(false);
        return;
      }

      try {
        // By user_id first
        const { data: byUser } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', uid)
          .order('updated_at', { ascending: false })
          .limit(1);

        let record = byUser && byUser.length > 0 ? byUser[0] : null;

        // Fallback by email
        if (!record && user?.email) {
          const { data: byEmail } = await supabase
            .from('subscribers')
            .select('*')
            .eq('email', user.email)
            .order('updated_at', { ascending: false })
            .limit(1);

          record = byEmail && byEmail.length > 0 ? byEmail[0] : null;

          if (record && !record.user_id) {
            try {
              await supabase.from('subscribers').update({ user_id: uid }).eq('id', record.id);
              record.user_id = uid;
            } catch { /* ignore */ }
          }
        }

        if (record) {
          setSubscription(record);
          setCachedSubscription(uid, record);
          setHasCachedData(true);
        } else {
          setSubscription(null);
        }
      } catch {
        // Keep last known good state
        if (!subscriptionRef.current) setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    _fetchInProgress = doFetch().finally(() => { _fetchInProgress = null; });
    await _fetchInProgress;
  }, []); // no deps – uses refs

  // ── Mount: load cache synchronously, then fetch once ───────────────
  useEffect(() => {
    if (!user?.id) {
      setSubscription(null);
      setLoading(false);
      setLoadingRole(false);
      return;
    }

    // Synchronous cache hydration
    const cached = getCachedSubscription(user.id);
    if (cached) {
      setSubscription(cached);
      setHasCachedData(true);
      setLoading(false);
    }

    // Single async fetch (respects cache TTL)
    fetchSubscription();
    fetchUserRole();

    // NO interval – revalidation only on explicit refetch
  }, [user?.id]); // ONLY re-run when user changes

  // ── Derived values (memoized via useCallback) ──────────────────────
  const isSubscriptionActive = useCallback(() => {
    if (userRole?.role === 'admin') return true;
    if (!subscription) return false;

    if (subscription.subscription_end) {
      if (new Date(subscription.subscription_end) <= new Date()) return false;
    }

    if (subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing') return true;
    if (['cancelled', 'expired', 'past_due'].includes(subscription.subscription_status)) return false;
    if (!subscription.subscribed) return false;

    return true;
  }, [subscription, userRole]);

  const getDaysRemaining = useCallback(() => {
    if (!subscription?.subscription_end) return null;
    const diff = new Date(subscription.subscription_end).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [subscription]);

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
