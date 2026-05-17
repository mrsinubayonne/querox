import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineHealth } from '@/hooks/useOfflineHealth';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncEngine } from '@/lib/syncEngine';
import { toast } from 'sonner';

export const NetworkStatusBanner = () => {
  const { status, isOffline, isUnstable, retryConnection } = useNetworkStatus();
  const { pendingCount, failedCount, oldestMutationAge, level, alerts } = useOfflineHealth();
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (wasOffline && status === 'online') {
      toast.success('Connexion rétablie', { description: 'Synchronisation des données en cours...' });
      syncEngine.forceSync();
      queryClient.resumePausedMutations().then(() => {
        queryClient.invalidateQueries();
      });
    }
    setWasOffline(isOffline || isUnstable);
  }, [status, wasOffline, isOffline, isUnstable, queryClient]);

  const handleRetry = async () => {
    setIsRetrying(true);
    retryConnection();
    await syncEngine.forceSync();
    queryClient.resumePausedMutations().then(() => {
      queryClient.invalidateQueries();
    });
    setTimeout(() => setIsRetrying(false), 1500);
  };

  const formatAge = (ms: number | null) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
  };

  if (status === 'online' && level === 'healthy') {
    return null;
  }

  const isCritical = level === 'critical';
  const isWarning = level === 'warning';

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl shadow-lg transition-all duration-300 ${
        isCritical
          ? 'bg-destructive text-destructive-foreground animate-pulse'
          : isOffline
          ? 'bg-destructive/90 text-destructive-foreground'
          : isWarning
          ? 'bg-orange-500/90 text-white'
          : 'bg-orange-500/80 text-white'
      } backdrop-blur-md`}
    >
      {isOffline ? (
        <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
      ) : isCritical ? (
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
      ) : (
        <Wifi className="h-3.5 w-3.5 flex-shrink-0" />
      )}

      <div className="flex flex-col">
        <span className="font-semibold">
          {isOffline
            ? 'Hors ligne'
            : isCritical
            ? 'Sync critique'
            : isUnstable
            ? 'Connexion instable'
            : `${pendingCount} en attente`}
        </span>

        {oldestMutationAge && oldestMutationAge > 60000 && (
          <span className="text-[10px] opacity-80">
            Plus ancienne : {formatAge(oldestMutationAge)}
          </span>
        )}

        {alerts.length > 0 && (
          <span className="text-[10px] opacity-80">
            {alerts[0].message}
          </span>
        )}
      </div>

      {(pendingCount > 0 || failedCount > 0) && (
        <div className="flex items-center gap-1">
          {pendingCount > 0 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
          {failedCount > 0 && (
            <span className="bg-red-800/40 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              ✗ {failedCount}
            </span>
          )}
        </div>
      )}

      <button
        onClick={handleRetry}
        disabled={isRetrying}
        className="ml-0.5 opacity-70 hover:opacity-100 disabled:opacity-30 transition-opacity"
        title="Réessayer"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
