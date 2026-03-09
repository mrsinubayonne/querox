import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, RefreshCw, CloudOff, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { getPendingCount } from '@/lib/offlineQueue';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useOfflineHealth } from '@/hooks/useOfflineHealth';

export const NetworkStatusBanner = () => {
  const { status, isOffline, isUnstable, retryConnection } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();
  const pendingCount = getPendingCount();
  const { pendingCount: syncPending } = useSyncStatus();
  const { isCritical, queueHealth, oldestPendingAge } = useOfflineHealth();
  const totalPending = pendingCount + syncPending;

  useEffect(() => {
    if (wasOffline && status === 'online') {
      toast({
        title: '✅ Connexion rétablie',
        description: `Synchronisation de ${totalPending} modification(s) en cours...`,
      });
      queryClient.resumePausedMutations().then(() => {
        queryClient.invalidateQueries();
      });
    }
    setWasOffline(isOffline || isUnstable);
  }, [status, wasOffline, isOffline, isUnstable, queryClient, totalPending]);

  const handleRetry = async () => {
    setIsRetrying(true);
    retryConnection();
    queryClient.resumePausedMutations().then(() => {
      queryClient.invalidateQueries();
    });
    setTimeout(() => setIsRetrying(false), 1500);
  };

  if (status === 'online' && !isCritical) return null;

  const bgClass = isCritical 
    ? 'bg-destructive/90 text-destructive-foreground'
    : isOffline
      ? 'bg-warning/90 text-warning-foreground'
      : 'bg-primary/90 text-primary-foreground';

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 text-xs font-semibold px-4 py-2 rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 ${bgClass}`}
    >
      {isCritical ? (
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 animate-pulse" />
      ) : isOffline ? (
        <CloudOff className="h-3.5 w-3.5 flex-shrink-0" />
      ) : (
        <Wifi className="h-3.5 w-3.5 flex-shrink-0 animate-pulse" />
      )}

      <span>
        {isCritical ? 'Attention: Synchronisation bloquée' : isOffline ? 'Mode hors ligne' : 'Connexion instable'}
      </span>

      {isCritical && oldestPendingAge && (
        <span className="hidden sm:inline opacity-80 border-l border-current pl-2 ml-1">
          bloqué depuis {oldestPendingAge}
        </span>
      )}

      {totalPending > 0 && (
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
          {totalPending}
        </span>
      )}

      <button
        onClick={handleRetry}
        disabled={isRetrying}
        className="ml-0.5 p-1 rounded-full hover:bg-white/20 disabled:opacity-30 transition-all"
        title="Réessayer la connexion"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
