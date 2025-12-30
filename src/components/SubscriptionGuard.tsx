
import React, { useEffect, useState } from 'react';
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
const getTeamMemberFromStorage = (): { memberId: string; ownerId: string } | null => {
  try {
    const teamMemberStr = localStorage.getItem('teamMember') || localStorage.getItem('team_member_session');
    if (!teamMemberStr) return null;
    
    const member = JSON.parse(teamMemberStr);
    if (member?.memberId && member?.ownerId) {
      return member;
    }
    return null;
  } catch {
    return null;
  }
};

// Repair cache function
const repairApplicationCache = async () => {
  console.log('🔧 Starting application cache repair...');
  
  try {
    // Clear subscription-related localStorage keys
    const keysToRemove = [];
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

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('🔄 Unregistered service worker:', registration.scope);
      }
    }

    // Clear PWA caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('🗑️ Deleted cache:', cacheName);
      }
    }

    toast.success('Cache réparé ! L\'application va redémarrer...');
    
    // Force reload after a brief delay
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
  const [isTeamMember] = useState(() => getTeamMemberFromStorage() !== null);
  
  // Grace period: don't show paywall for first 3 seconds to allow data to load
  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setGracePeriodExpired(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Force refetch on mount to ensure fresh data
  useEffect(() => {
    console.log('🔄 SubscriptionGuard mounted, triggering refetch...');
    refetch(true); // Force refresh, ignore cache
  }, []);

  const handleRefresh = async () => {
    console.log('🔄 Rafraîchissement manuel de l\'abonnement');
    toast.info('Actualisation en cours...');
    await refetch(true); // Force refresh
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
      subscription: subscription ? {
        tier: subscription.subscription_tier,
        status: subscription.subscription_status,
        subscribed: subscription.subscribed,
        end: subscription.subscription_end
      } : null,
      isSubscriptionActive
    });
  }, [isAdmin, isTeamMember, loading, gracePeriodExpired, hasCachedData, subscription, isSubscriptionActive]);

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
  
  // Priority 3: Active subscription
  if (isActive) {
    return <>{children}</>;
  }

  // If we have cached data showing active, trust it during loading
  if (hasCachedData && loading) {
    console.log('⏳ Loading with cache, showing children...');
    return <>{children}</>;
  }

  // Grace period: show spinner instead of paywall
  if (!gracePeriodExpired || loading) {
    console.log('⏳ Grace period or loading, showing verification spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Vérification de l'abonnement...</p>
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
          
          {/* Debug info (hidden by default, visible in console) */}
          <div className="text-xs text-left bg-muted/50 p-2 rounded hidden">
            <p>User subscription status: {subscription?.subscription_status || 'null'}</p>
            <p>Tier: {subscription?.subscription_tier || 'null'}</p>
            <p>End: {subscription?.subscription_end || 'null'}</p>
          </div>
          
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
