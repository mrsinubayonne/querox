
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, RefreshCw, Shield, Wrench, Users } from 'lucide-react';
import { toast } from 'sonner';
import { localStore } from '@/lib/localStore';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

const getTeamMemberFromStorage = (): boolean => {
  try {
    const m = localStore.raw.getWithTTL<any | null>('teamMember', null)
      || localStore.raw.getWithTTL<any | null>('team_member_session', null);
    return !!(m?.memberId && m?.ownerId);
  } catch { return false; }
};

const SUBSCRIPTION_PROOF_KEY = 'querox_subscription_proof';

const saveSubscriptionProof = (subscriptionEnd: string | null) => {
  try {
    const proofExpiry = subscriptionEnd
      ? new Date(subscriptionEnd).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(SUBSCRIPTION_PROOF_KEY, JSON.stringify({
      verified: true,
      lastVerified: new Date().toISOString(),
      subscriptionEnd,
      expiresAt: proofExpiry,
    }));
  } catch { /* ignore */ }
};

const clearSubscriptionProof = () => {
  localStorage.removeItem(SUBSCRIPTION_PROOF_KEY);
};

const hasValidSubscriptionProof = (): boolean => {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_PROOF_KEY);
    if (!raw) return false;
    const proof = JSON.parse(raw);
    const now = new Date();
    if (new Date(proof.expiresAt) <= now) { clearSubscriptionProof(); return false; }
    if (proof.subscriptionEnd && new Date(proof.subscriptionEnd) <= now) { clearSubscriptionProof(); return false; }
    return true;
  } catch { return false; }
};

const hasAnyValidCachedSubscription = (): boolean => {
  try {
    if (hasValidSubscriptionProof()) return true;
    const now = new Date();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('subscription_cache_')) continue;
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      if (data.subscription_end && new Date(data.subscription_end) <= now) { localStorage.removeItem(key); continue; }
      if (['expired', 'cancelled'].includes(data.subscription_status)) { localStorage.removeItem(key); continue; }
      if (data.subscription_status === 'active' || data.subscription_status === 'trialing' || (data.subscribed && !data.subscription_end)) {
        saveSubscriptionProof(data.subscription_end);
        return true;
      }
    }
    return false;
  } catch { return false; }
};

const repairApplicationCache = async () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('subscription_cache_') || key === 'selectedOutletId' || key === 'selectedProfileId')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
    }
    if ('caches' in window) {
      const names = await caches.keys();
      for (const n of names) await caches.delete(n);
    }
    toast.success("Cache réparé ! L'application va redémarrer...");
    setTimeout(() => window.location.reload(), 1000);
  } catch {
    toast.error('Erreur lors de la réparation.');
  }
};

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children, feature = "cette fonctionnalité" }) => {
  const { isSubscriptionActive, loading, refetch, isAdmin, subscription, hasCachedData } = useSubscription();
  const navigate = useNavigate();
  const { isOffline } = useNetworkStatus();
  const isTeamMember = getTeamMemberFromStorage();
  const hasValidCache = useRef(hasAnyValidCachedSubscription());

  // Short grace period – avoid blocking the user; trust cache quickly
  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGracePeriodExpired(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Save/clear proof only when subscription object itself changes
  const prevSubId = useRef<string | null>(null);
  useEffect(() => {
    if (!subscription || subscription.id === prevSubId.current) return;
    prevSubId.current = subscription.id;
    const isExpired = subscription.subscription_end && new Date(subscription.subscription_end) <= new Date();
    if (isExpired) { clearSubscriptionProof(); hasValidCache.current = false; }
    else if (isSubscriptionActive) { saveSubscriptionProof(subscription.subscription_end); }
  }, [subscription?.id, subscription?.subscription_status]);

  const handleRefresh = async () => {
    toast.info('Actualisation en cours...');
    await refetch(true);
    toast.success('Statut actualisé');
  };

  // ── Offline bypass: allow access when offline (user already authenticated) ──
  if (isOffline) return <>{children}</>;

  // ── Render logic (no side-effects, no refetch triggers) ────────────
  if (isAdmin) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
            <Shield className="w-3 h-3" /><span>Mode Admin</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (isTeamMember) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
            <Users className="w-3 h-3" /><span>Mode Équipe</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  const isExpired = subscription?.subscription_end && new Date(subscription.subscription_end) <= new Date();
  const isActive = !isExpired && (isSubscriptionActive || subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing');

  if (isActive) return <>{children}</>;

  // Trust cache while loading (unless expired) — never block the UI when cache is valid
  if ((hasValidCache.current || hasCachedData) && !isExpired) return <>{children}</>;

  // Expired → paywall immediately
  if (isExpired) { /* fall through to paywall */ }

  // Short grace period spinner (max 2s) — never block beyond grace, even if loading hangs
  if (!isExpired && !gracePeriodExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Vérification de l'abonnement...</p>
        </div>
      </div>
    );
  }

  // Paywall
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Abonnement requis</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">Pour accéder à {feature}, vous devez avoir un abonnement QUEROX actif.</p>
          <div className="space-y-2">
            <Button onClick={handleRefresh} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />Actualiser le statut
            </Button>
            <Button onClick={repairApplicationCache} variant="outline" className="w-full">
              <Wrench className="w-4 h-4 mr-2" />Réparer l'application (cache)
            </Button>
            <Button onClick={() => navigate('/abonnement')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Crown className="w-4 h-4 mr-2" />Choisir un abonnement
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">Retour à l'accueil</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;
