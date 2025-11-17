import React, { useEffect, useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { syncService } from '@/services/SyncService';
import { clearDB, getStorageUsage } from '@/lib/offlineDB';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { RefreshCw, Trash2, Database, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SyncStatus: React.FC = () => {
  const { isOnline } = useOnlineStatus();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [storage, setStorage] = useState({ usage: 0, quota: 0 });
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    const items = await syncService.getQueueItems();
    setQueueItems(items);
    
    const logs = await syncService.getSyncLogs(20);
    setSyncLogs(logs);
    
    const storageInfo = await getStorageUsage();
    setStorage(storageInfo);
  };

  useEffect(() => {
    loadData();
    
    const unsubscribe = syncService.onStatusChange(() => {
      loadData();
    });
    
    return unsubscribe;
  }, []);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await syncService.syncAll();
      toast({
        title: "✅ Synchronisation terminée",
        description: "Toutes les données ont été synchronisées",
      });
    } catch (error) {
      toast({
        title: "❌ Erreur de synchronisation",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
      loadData();
    }
  };

  const handleClearCache = async () => {
    if (confirm('Êtes-vous sûr de vouloir vider le cache local ? Cette action est irréversible.')) {
      await clearDB();
      toast({
        title: "🗑️ Cache vidé",
        description: "Toutes les données locales ont été supprimées",
      });
      loadData();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const storagePercent = storage.quota > 0 
    ? Math.round((storage.usage / storage.quota) * 100) 
    : 0;

  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">État de la Synchronisation</h1>
          <p className="text-muted-foreground mt-2">
            Gérez la synchronisation de vos données hors ligne
          </p>
        </div>

        {/* Status général */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connexion</CardTitle>
              {isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions en attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueItems.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stockage utilisé</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storagePercent}%</div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(storage.usage)} / {formatBytes(storage.quota)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Gérez vos données locales</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={handleForceSync}
              disabled={!isOnline || syncing || queueItems.length === 0}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Forcer la synchronisation
            </Button>
            <Button onClick={handleClearCache} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Vider le cache
            </Button>
          </CardContent>
        </Card>

        {/* File d'attente */}
        {queueItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>File d'attente ({queueItems.length})</CardTitle>
              <CardDescription>Actions en attente de synchronisation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {queueItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <Badge variant="secondary">{item.action}</Badge>
                      <span className="ml-2 text-sm">{item.table}</span>
                      {item.retries > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {item.retries} tentative(s)
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.timestamp), 'Pp', { locale: fr })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historique */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des synchronisations</CardTitle>
            <CardDescription>Dernières synchronisations effectuées</CardDescription>
          </CardHeader>
          <CardContent>
            {syncLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun historique disponible</p>
            ) : (
              <div className="space-y-2">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      {log.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">
                        {log.itemCount} élément(s) - {log.table}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({log.duration}ms)
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), 'Pp', { locale: fr })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWithSidebar>
  );
};

export default SyncStatus;
