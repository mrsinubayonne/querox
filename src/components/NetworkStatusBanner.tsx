import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { getPendingCount } from '@/lib/offlineQueue';

export const NetworkStatusBanner = () => {
  const { status, isOffline, isUnstable, retryConnection } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();
  const pendingCount = getPendingCount();

  // Show toast and sync when connection is restored
  useEffect(() => {
    if (wasOffline && status === 'online') {
      toast({
        title: 'Connexion rétablie',
        description: 'Synchronisation des données en cours...',
      });
      // Resume paused mutations and refetch data
      queryClient.resumePausedMutations().then(() => {
        queryClient.invalidateQueries();
      });
    }
    setWasOffline(isOffline || isUnstable);
  }, [status, wasOffline, isOffline, isUnstable, queryClient]);

  const handleRetry = async () => {
    setIsRetrying(true);
    retryConnection();
    // Resume paused mutations and refetch
    queryClient.resumePausedMutations().then(() => {
      queryClient.invalidateQueries();
    });
    // Small delay to show loading state
    setTimeout(() => setIsRetrying(false), 1500);
  };

  if (status === 'online') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity cursor-default ${
        isOffline
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-orange-500 text-white'
      }`}
    >
      {isOffline ? (
        <WifiOff className="h-3 w-3 flex-shrink-0" />
      ) : (
        <Wifi className="h-3 w-3 flex-shrink-0" />
      )}

      <span>
        {isOffline ? 'Hors ligne' : 'Connexion instable'}
      </span>

      {pendingCount > 0 && (
        <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-xs">
          {pendingCount}
        </span>
      )}

      <button
        onClick={handleRetry}
        disabled={isRetrying}
        className="ml-0.5 opacity-70 hover:opacity-100 disabled:opacity-30 transition-opacity"
        title="Réessayer"
      >
        <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
