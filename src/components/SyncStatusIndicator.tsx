import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    if (isOffline) {
      return <CloudOff className="h-4 w-4 text-destructive" />;
    }
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
    }
    if (failedCount > 0) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (pendingCount > 0) {
      return <Cloud className="h-4 w-4 text-orange-500" />;
    }
    return <Check className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isOffline) return 'Hors ligne';
    if (isSyncing) return 'Synchronisation...';
    if (failedCount > 0) return `${failedCount} erreur(s)`;
    if (pendingCount > 0) return `${pendingCount} en attente`;
    return 'Synchronisé';
  };

  const hasIssues = failedCount > 0 || pendingCount > 0 || isOffline;

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-8 gap-1.5 px-2"
              >
                {getStatusIcon()}
                {hasIssues && (
                  <span className="text-xs font-medium">
                    {pendingCount + failedCount > 0 ? pendingCount + failedCount : ''}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-72" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Synchronisation</h4>
              {getStatusIcon()}
            </div>

            {isSyncing && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {progress}%
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut</span>
                <span className={isOffline ? 'text-destructive' : 'text-foreground'}>
                  {isOffline ? 'Hors ligne' : 'En ligne'}
                </span>
              </div>

              {pendingCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">En attente</span>
                  <span className="text-orange-500 font-medium">{pendingCount}</span>
                </div>
              )}

              {failedCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Erreurs</span>
                  <span className="text-destructive font-medium">{failedCount}</span>
                </div>
              )}

              {lastSyncTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dernière sync</span>
                  <span>
                    {format(lastSyncTime, 'HH:mm', { locale: fr })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={forceSync}
                disabled={isSyncing || isOffline}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                Synchroniser
              </Button>
              
              {failedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={retryFailed}
                  disabled={isSyncing || isOffline}
                >
                  Réessayer
                </Button>
              )}
            </div>

            {isOffline && (
              <p className="text-xs text-muted-foreground text-center">
                Les modifications seront synchronisées automatiquement à la reconnexion
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
