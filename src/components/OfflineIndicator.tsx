import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncService, SyncStatus } from '@/services/SyncService';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'success', itemCount: 0 });
  const { toast } = useToast();
  const [prevOnlineState, setPrevOnlineState] = useState(isOnline);

  useEffect(() => {
    const loadQueueCount = async () => {
      const count = await syncService.getQueueCount();
      setSyncStatus({ status: 'queued', itemCount: count });
    };
    
    loadQueueCount();

    const unsubscribe = syncService.onStatusChange((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (prevOnlineState !== isOnline) {
      if (isOnline) {
        toast({
          title: "🌐 Connexion rétablie",
          description: "Synchronisation en cours...",
          duration: 3000,
        });
        syncService.syncAll();
      } else {
        toast({
          title: "📴 Mode hors ligne",
          description: "Vos données seront synchronisées au retour de la connexion",
          duration: 5000,
        });
      }
      setPrevOnlineState(isOnline);
    }
  }, [isOnline, prevOnlineState, toast]);

  if (isOnline && syncStatus.itemCount === 0) {
    return null; // Ne rien afficher si tout est OK
  }

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (syncStatus.status === 'syncing') return 'default';
    if (syncStatus.itemCount > 0) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    if (syncStatus.status === 'syncing') return <RefreshCw className="h-3 w-3 animate-spin" />;
    return <Wifi className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (!isOnline) {
      return syncStatus.itemCount > 0 
        ? `Hors ligne - ${syncStatus.itemCount} action(s) en attente`
        : 'Mode hors ligne';
    }
    if (syncStatus.status === 'syncing') {
      return 'Synchronisation...';
    }
    if (syncStatus.itemCount > 0) {
      return `${syncStatus.itemCount} action(s) en attente`;
    }
    return 'En ligne';
  };

  return (
    <Badge variant={getStatusColor()} className="flex items-center gap-2">
      {getStatusIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );
};
