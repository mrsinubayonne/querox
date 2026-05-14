import { useState, useEffect, useCallback } from 'react';
import { syncEngine, SyncStatus } from '@/lib/syncEngine';
import { getStorageStats } from '@/lib/offlineStorage';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    failedCount: 0,
    progress: 0,
  });

  useEffect(() => {
    // Subscribe to sync status updates
    const unsubscribe = syncEngine.subscribe(setStatus);

    // Also get initial status
    syncEngine.getStatus().then(setStatus);

    return unsubscribe;
  }, []);

  const forceSync = useCallback(async () => {
    return syncEngine.forceSync();
  }, []);

  const retryFailed = useCallback(async () => {
    return syncEngine.retryFailed();
  }, []);

  const discardBlocked = useCallback(async () => {
    return syncEngine.discardBlockedMutations();
  }, []);

  const getStats = useCallback(async () => {
    return getStorageStats();
  }, []);

  return {
    ...status,
    forceSync,
    retryFailed,
    discardBlocked,
    getStats,
  };
}
