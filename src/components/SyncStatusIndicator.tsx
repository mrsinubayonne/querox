import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineHealth } from '@/hooks/useOfflineHealth';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAllMutations, type QueuedMutation } from '@/lib/offlineStorage';
import { useQueryClient } from '@tanstack/react-query';
import {
import { toast } from 'sonner';
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
    discardBlocked,
  } = useSyncStatus();
  const { isOffline } = useNetworkStatus();
  const { level, oldestMutationAge, alerts, refresh } = useOfflineHealth();
  const queryClient = useQueryClient();
  const [stuckMutations, setStuckMutations] = useState<QueuedMutation[]>([]);
  const [discarding, setDiscarding] = useState(false);
  const STUCK_THRESHOLD_MS = 30 * 60 * 1000;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const all = await getAllMutations();
      const now = Date.now();
      const stuck = all.filter(
        (m) => !m.synced && (m.failed || now - m.timestamp > STUCK_THRESHOLD_MS || m.retryCount >= 3),
      );
      if (!cancelled) setStuckMutations(stuck);
    };
    load();
    window.addEventListener('querox-sync-queue-changed', load);
    const i = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(i); window.removeEventListener('querox-sync-queue-changed', load); };
  }, [pendingCount, failedCount, isSyncing]);

  const lastError = stuckMutations.find((m) => m.errorMessage)?.errorMessage;

  const discardStuck = async () => {
    if (!stuckMutations.length) return;
    if (!window.confirm(`Abandonner ${stuckMutations.length} mutation(s) bloquée(s) ? Cette action est irréversible.`)) return;
    setDiscarding(true);
    try {
      const removed = await discardBlocked();
      toast.success('File d\'attente vidée', { description: `${removed} mutation(s) supprimée(s).` });
      setStuckMutations([]);
      window.dispatchEvent(new CustomEvent('querox-sync-queue-changed'));
      await refresh();
      queryClient.invalidateQueries();
    } catch {
      toast.error('Erreur', { description: 'Impossible de vider la file.' });
    } finally {
      setDiscarding(false);
    }
  };

  const formatAge = (ms: number | null) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
  };

  const getStatusIcon = () => {
    if (isOffline) return <CloudOff className="h-4 w-4 text-destructive" />;
    if (level === 'critical') return <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
    if (failedCount > 0) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (pendingCount > 0) return <Cloud className="h-4 w-4 text-orange-500" />;
    return <Check className="h-4 w-4 text-green-500" />;
  };

  const hasIssues = failedCount > 0 || pendingCount > 0 || isOffline || level !== 'healthy';
  const totalBadge = pendingCount + failedCount;
  const showDiscardAction = hasIssues && (failedCount > 0 || stuckMutations.length > 0 || (oldestMutationAge ?? 0) > STUCK_THRESHOLD_MS);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative h-9 gap-1.5 px-2.5 rounded-xl border transition-all duration-300 ${
            level === 'critical'
              ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10'
              : level === 'warning'
              ? 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10'
              : 'border-border/50 bg-background/60 hover:bg-accent/50'
          } backdrop-blur-lg`}
        >
          {getStatusIcon()}
          {totalBadge > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
              level === 'critical'
                ? 'bg-destructive text-destructive-foreground'
                : failedCount > 0
                ? 'bg-destructive/80 text-destructive-foreground'
                : 'bg-orange-500/80 text-white'
            }`}>
              {totalBadge}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 backdrop-blur-xl bg-card/95 border-border/50 shadow-2xl" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Synchronisation</h4>
            {getStatusIcon()}
          </div>

          {isSyncing && (
            <div className="space-y-1.5">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{progress}%</p>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Statut</span>
              <span className={`font-medium ${
                isOffline ? 'text-destructive' : level === 'critical' ? 'text-destructive' : 'text-foreground'
              }`}>
                {isOffline ? 'Hors ligne' : level === 'critical' ? 'Critique' : level === 'warning' ? 'Attention' : 'En ligne'}
              </span>
            </div>

            {pendingCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">En attente</span>
                <span className="text-orange-500 font-medium">{pendingCount}</span>
              </div>
            )}

            {failedCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Erreurs</span>
                <span className="text-destructive font-medium">{failedCount}</span>
              </div>
            )}

            {oldestMutationAge && oldestMutationAge > 60000 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plus ancienne</span>
                <span className={`font-medium ${
                  oldestMutationAge > 30 * 60000 ? 'text-destructive' : 'text-orange-500'
                }`}>
                  {formatAge(oldestMutationAge)}
                </span>
              </div>
            )}

            {lastSyncTime && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dernière sync</span>
                <span>{format(lastSyncTime, 'HH:mm', { locale: fr })}</span>
              </div>
            )}
          </div>

          {/* Health alerts */}
          {alerts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                    alert.level === 'critical'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-orange-500/10 text-orange-600'
                  }`}
                >
                  {alert.level === 'critical' ? (
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  )}
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {lastError && (
            <div className="text-[11px] px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive break-words">
              <span className="font-semibold">Dernière erreur :</span> {lastError}
            </div>
          )}

          {showDiscardAction && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full"
              onClick={discardStuck}
              disabled={discarding || stuckMutations.length === 0}
            >
              <Trash2 className={`h-3.5 w-3.5 mr-1.5 ${discarding ? 'animate-pulse' : ''}`} />
              Supprimer les blocages ({stuckMutations.length})
            </Button>
          )}

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

          {showDiscardAction && (
            <div className="space-y-1.5 pt-1 border-t border-border/50">
              <p className="text-[11px] text-muted-foreground">
                {stuckMutations.length > 0
                  ? `${stuckMutations.length} mutation(s) bloquée(s) peuvent être supprimée(s).`
                  : 'Les blocages supprimables apparaîtront ici après 3 échecs ou 30 minutes.'}
              </p>
            </div>
          )}

          {isOffline && (
            <p className="text-xs text-muted-foreground text-center">
              Les modifications seront synchronisées à la reconnexion
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
