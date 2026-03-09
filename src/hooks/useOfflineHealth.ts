import { useState, useEffect, useCallback } from 'react';
import { getSyncQueueHealth } from '@/lib/conflictResolution';
import { useSyncStatus } from './useSyncStatus';

type QueueHealth = 'healthy' | 'warning' | 'critical';

interface OfflineHealthStatus {
  queueHealth: QueueHealth;
  pendingCount: number;
  failedCount: number;
  oldestPendingAge: string | null;
  isHealthy: boolean;
  isCritical: boolean;
}

export function useOfflineHealth(): OfflineHealthStatus {
  const { pendingCount: syncPending, failedCount: syncFailed } = useSyncStatus();
  const [health, setHealth] = useState<OfflineHealthStatus>({
    queueHealth: 'healthy',
    pendingCount: 0,
    failedCount: 0,
    oldestPendingAge: null,
    isHealthy: true,
    isCritical: false,
  });

  const checkHealth = useCallback(async () => {
    try {
      const queueHealth = await getSyncQueueHealth();
      
      let ageString: string | null = null;
      if (queueHealth.oldestPendingAge) {
        const minutes = Math.floor(queueHealth.oldestPendingAge / 60000);
        if (minutes < 60) ageString = `${minutes}min`;
        else ageString = `${Math.floor(minutes / 60)}h${minutes % 60}min`;
      }

      setHealth({
        queueHealth: queueHealth.healthStatus,
        pendingCount: queueHealth.pendingCount + syncPending,
        failedCount: queueHealth.failedCount + syncFailed,
        oldestPendingAge: ageString,
        isHealthy: queueHealth.healthStatus === 'healthy',
        isCritical: queueHealth.healthStatus === 'critical',
      });
    } catch {
      // Silently fail - health check is non-critical
    }
  }, [syncPending, syncFailed]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return health;
}
