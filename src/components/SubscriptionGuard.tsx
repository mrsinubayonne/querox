
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, RefreshCw, Shield, Wrench, Users } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

// Helper function to detect team member from localStorage (synchronous, instant)
const getTeamMemberFromStorage = (): boolean => {
  try {
    const teamMemberStr = localStorage.getItem('teamMember') || localStorage.getItem('team_member_session');
    if (!teamMemberStr) return false;
    
    const member = JSON.parse(teamMemberStr);
    return !!(member?.memberId && member?.ownerId);
  } catch {
    return false;
  }
};

// PERSISTENT subscription proof - survives even if other caches fail
const SUBSCRIPTION_PROOF_KEY = 'querox_subscription_proof';

const saveSubscriptionProof = () => {
  try {
    const proof = {
      verified: true,
      lastVerified: new Date().toISOString(),
      // Valid for 7 days - generous buffer for slow connections
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem(SUBSCRIPTION_PROOF_KEY, JSON.stringify(proof));
    console.log('💾 Saved subscription proof');
  } catch {
    // Ignore
  }
};

const hasValidSubscriptionProof = (): boolean => {
  try {
    const proofStr = localStorage.getItem(SUBSCRIPTION_PROOF_KEY);
    if (!proofStr) return false;
    
    const proof = JSON.parse(proofStr);
    if (proof.verified && new Date(proof.expiresAt) > new Date()) {
      console.log('🔒 Found valid subscription proof (expires:', proof.expiresAt, ')');
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Check if ANY valid subscription was ever cached (emergency fallback)
const hasAnyValidCachedSubscription = (): boolean => {
  try {
    // First check our persistent proof
    if (hasValidSubscriptionProof()) {
      return true;
    }
    
    // Then check subscription caches
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('subscription_cache_')) {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.subscription_status === 'active' || data.subscribed) {
          if (!data.subscription_end || new Date(data.subscription_end) > new Date()) {
            console.log('🔒 Found valid cached subscription in localStorage');
            // Save proof for future slow connections
            saveSubscriptionProof();
            return true;
          }
        }
      }
    }
    return false;
  } catch {
    return false;
  }
};

// Repair cache function
const repairApplicationCache = async () => {
  console.log('🔧 Starting application cache repair...');
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('subscription_cache_') ||
        key === 'selectedOutletId' ||
        key === 'selectedProfileId'
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ Cleared localStorage keys:', keysToRemove);

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('🔄 Unregistered service worker:', registration.scope);
      }
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('🗑️ Deleted cache:', cacheName);
      }
    }

    toast.success('Cache réparé ! L\'application va redémarrer...');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('Error repairing cache:', error);
    toast.error('Erreur lors de la réparation. Essayez de vider manuellement le cache du navigateur.');
  }
};

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  feature = "cette fonctionnalité" 
}) => {
  const { isSubscriptionActive, loading, refetch, isAdmin, subscription, hasCachedData } = useSubscription();
  const navigate = useNavigate();
  
  // INSTANT team member detection from localStorage (no async delay)
  const isTeamMember = getTeamMemberFromStorage();
  
  // Check for any cached valid subscription as emergency fallback
  const hasValidCache = useRef(hasAnyValidCachedSubscription());
  
  // Grace period: EXTENDED to 15 seconds for slow connections/weak devices
  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5; // More retries for unreliable connections
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setGracePeriodExpired(true);
    }, 15000); // 15 seconds for slow connections
    return () => clearTimeout(timer);
  }, []);

  // Force refetch on mount AND after grace period
  useEffect(() => {
    console.log('🔄 SubscriptionGuard mounted, triggering refetch...');
    refetch(true);
  }, []);
  
  // Retry refetch with exponential backoff for slow connections
  useEffect(() => {
    if (gracePeriodExpired && !isSubscriptionActive && !loading && retryCount < maxRetries) {
      const delay = Math.min(2000 * Math.pow(1.5, retryCount), 10000); // 2s, 3s, 4.5s, 6.75s, 10s
      console.log(`🔄 Retry ${retryCount + 1}/${maxRetries} in ${delay}ms...`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refetch(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [gracePeriodExpired, isSubscriptionActive, loading, retryCount]);
  
  // Save proof when subscription is confirmed active
  useEffect(() => {
    if (isSubscriptionActive || subscription?.subscription_status === 'active') {
      saveSubscriptionProof();
    }
  }, [isSubscriptionActive, subscription]);

  const handleRefresh = async () => {
    console.log('🔄 Rafraîchissement manuel de l\'abonnement');
    toast.info('Actualisation en cours...');
    await refetch(true);
    toast.success('Statut actualisé');
  };

  // Log diagnostic info
  useEffect(() => {
    console.log('📊 SubscriptionGuard diagnostic:', {
      isAdmin,
      isTeamMember,
      loading,
      gracePeriodExpired,
      hasCachedData,
      hasValidCache: hasValidCache.current,
      retryCount,
      subscription: subscription ? {
        tier: subscription.subscription_tier,
        status: subscription.subscription_status,
        subscribed: subscription.subscribed,
        end: subscription.subscription_end
      } : null,
      isSubscriptionActive
    });
  }, [isAdmin, isTeamMember, loading, gracePeriodExpired, hasCachedData, subscription, isSubscriptionActive, retryCount]);

  // Priority 1: Admin bypass
  if (isAdmin) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
            <Shield className="w-3 h-3" />
            <span>Mode Admin</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Priority 2: Team member bypass (instant, no delay)
  if (isTeamMember) {
    console.log('👥 Team member detected (instant), bypassing subscription check');
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
            <Users className="w-3 h-3" />
            <span>Mode Équipe</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Check subscription status - multiple validation methods
  const isActive = isSubscriptionActive ||
    (subscription?.subscription_status === 'active') ||
    (subscription?.subscribed && (!subscription?.subscription_end || new Date(subscription.subscription_end) > new Date()));
  
  // Priority 3: Active subscription confirmed
  if (isActive) {
    return <>{children}</>;
  }

  // Priority 4: If we have ANY cached valid subscription, trust it while loading/refreshing
  if (hasValidCache.current || hasCachedData) {
    console.log('⏳ Has valid cache, showing children while confirming...');
    return <>{children}</>;
  }

  // Priority 5: Grace period - always show spinner, never paywall early
  // Extended conditions for slow connections
  if (!gracePeriodExpired || loading || retryCount < maxRetries) {
    console.log(`⏳ Verification in progress (retry ${retryCount}/${maxRetries}, grace: ${gracePeriodExpired}, loading: ${loading})`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Vérification de l'abonnement...
            {retryCount > 0 && <span className="block text-xs mt-1">Tentative {retryCount}/{maxRetries}</span>}
          </p>
        </div>
      </div>
    );
  }

  // Final: Show subscription required screen with repair option
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Abonnement requis
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Pour accéder à {feature}, vous devez avoir un abonnement QUEROX actif.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser le statut
            </Button>
            
            <Button 
              onClick={repairApplicationCache}
              variant="outline"
              className="w-full"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Réparer l'application (cache)
            </Button>
            
            <Button 
              onClick={() => navigate('/abonnement')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Choisir un abonnement
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;
