import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const SyncStatusIndicator = () => {
  const { 
    isSyncing, 
    lastSyncTime, 
    pendingCount, 
    failedCount, 
    progress,
    forceSync,
    retryFailed,
  } = useSyncStatus();
  const { isOffline } = useNetworkStatus();

  const getStatusIcon = () => {
    if (isOffline) return <CloudOff className="h-4 w-4 text-destructive" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
    if (failedCount > 0) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (pendingCount > 0) return <Cloud className="h-4 w-4 text-warning" />;
    return <Check className="h-4 w-4 text-success" />;
  };

  const getStatusLabel = () => {
    if (isOffline) return 'Hors ligne';
    if (isSyncing) return 'Synchronisation...';
    if (failedCount > 0) return `${failedCount} erreur(s)`;
    if (pendingCount > 0) return `${pendingCount} en attente`;
    return 'Synchronisé';
  };

  const showBadge = failedCount > 0 || pendingCount > 0;

  return (
    <div className="fixed top-4 right-4 z-[9998]">
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium text-foreground shadow-md hover:shadow-lg transition-all">
            {getStatusIcon()}
            <span className="hidden sm:inline">{getStatusLabel()}</span>
            {showBadge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse-glow">
                {pendingCount + failedCount}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-72" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Synchronisation
              </h4>
              {getStatusIcon()}
            </div>

            {isSyncing && (
              <div className="space-y-1.5">
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground text-center">{progress}%</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Statut</span>
                <span className={`font-medium ${isOffline ? 'text-destructive' : 'text-success'}`}>
                  {isOffline ? '🔴 Hors ligne' : '🟢 En ligne'}
                </span>
              </div>

              {pendingCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">En attente</span>
                  <span className="font-medium text-warning">{pendingCount}</span>
                </div>
              )}

              {failedCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Erreurs</span>
                  <span className="font-medium text-destructive">{failedCount}</span>
                </div>
              )}

              {lastSyncTime && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dernière sync</span>
                  <span className="font-medium">{format(lastSyncTime, 'HH:mm:ss', { locale: fr })}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={forceSync} disabled={isSyncing || isOffline}>
                <RefreshCw className={`h-3 w-3 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                Synchroniser
              </Button>
              {failedCount > 0 && (
                <Button size="sm" variant="outline" className="text-xs" onClick={retryFailed} disabled={isSyncing || isOffline}>
                  Réessayer
                </Button>
              )}
            </div>

            {isOffline && (
              <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-2">
                💾 Vos modifications sont sauvegardées localement et seront synchronisées automatiquement
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
