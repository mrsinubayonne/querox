import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllMutations, QueuedMutation } from '@/lib/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';

export type HealthLevel = 'healthy' | 'warning' | 'critical';

export interface OfflineHealthStatus {
  level: HealthLevel;
  pendingCount: number;
  failedCount: number;
  oldestMutationAge: number | null; // in ms
  stalledSince: number | null; // timestamp when sync appears stalled
  queueSizeBytes: number;
  lastCheckedAt: number;
  alerts: HealthAlert[];
}

export interface HealthAlert {
  id: string;
  level: HealthLevel;
  message: string;
  timestamp: number;
}

const WARNING_AGE_MS = 5 * 60 * 1000; // 5 minutes
const CRITICAL_AGE_MS = 30 * 60 * 1000; // 30 minutes
const STALL_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes without progress
const MAX_QUEUE_WARNING = 20;
const MAX_QUEUE_CRITICAL = 50;
const CHECK_INTERVAL = 15_000; // 15 seconds

export function useOfflineHealth() {
  const [health, setHealth] = useState<OfflineHealthStatus>({
    level: 'healthy',
    pendingCount: 0,
    failedCount: 0,
    oldestMutationAge: null,
    stalledSince: null,
    queueSizeBytes: 0,
    lastCheckedAt: Date.now(),
    alerts: [],
  });

  const { isOffline } = useNetworkStatus();
  const previousPendingRef = useRef<number>(0);
  const lastProgressRef = useRef<number>(Date.now());

  const checkHealth = useCallback(async () => {
    try {
      const mutations = await getAllMutations();
      const now = Date.now();

      const pending = mutations.filter(m => !m.synced && !m.failed);
      const failed = mutations.filter(m => m.failed);

      // Track progress (did queue size decrease?)
      if (pending.length < previousPendingRef.current) {
        lastProgressRef.current = now;
      }
      previousPendingRef.current = pending.length;

      // Calculate oldest mutation age
      let oldestAge: number | null = null;
      if (pending.length > 0) {
        const oldest = pending.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
        oldestAge = now - oldest.timestamp;
      }

      // Detect stall
      const stalledSince =
        pending.length > 0 && (now - lastProgressRef.current) > STALL_THRESHOLD_MS
          ? lastProgressRef.current
          : null;

      // Estimate queue size
      const queueSizeBytes = new Blob([JSON.stringify(mutations)]).size;

      // Build alerts
      const alerts: HealthAlert[] = [];

      if (failed.length > 0) {
        alerts.push({
          id: 'failed-mutations',
          level: failed.length >= 5 ? 'critical' : 'warning',
          message: `${failed.length} mutation(s) échouée(s)`,
          timestamp: now,
        });
      }

      if (oldestAge && oldestAge > CRITICAL_AGE_MS) {
        alerts.push({
          id: 'old-mutations-critical',
          level: 'critical',
          message: `Données non synchronisées depuis ${Math.round(oldestAge / 60000)} min`,
          timestamp: now,
        });
      } else if (oldestAge && oldestAge > WARNING_AGE_MS) {
        alerts.push({
          id: 'old-mutations-warning',
          level: 'warning',
          message: `Données en attente depuis ${Math.round(oldestAge / 60000)} min`,
          timestamp: now,
        });
      }

      if (stalledSince) {
        alerts.push({
          id: 'sync-stalled',
          level: 'critical',
          message: `Synchronisation bloquée depuis ${Math.round((now - stalledSince) / 60000)} min`,
          timestamp: now,
        });
      }

      if (pending.length >= MAX_QUEUE_CRITICAL) {
        alerts.push({
          id: 'queue-critical',
          level: 'critical',
          message: `File d'attente surchargée (${pending.length} éléments)`,
          timestamp: now,
        });
      } else if (pending.length >= MAX_QUEUE_WARNING) {
        alerts.push({
          id: 'queue-warning',
          level: 'warning',
          message: `File d'attente importante (${pending.length} éléments)`,
          timestamp: now,
        });
      }

      // Determine overall level
      let level: HealthLevel = 'healthy';
      if (alerts.some(a => a.level === 'critical')) level = 'critical';
      else if (alerts.some(a => a.level === 'warning')) level = 'warning';

      setHealth({
        level,
        pendingCount: pending.length,
        failedCount: failed.length,
        oldestMutationAge: oldestAge,
        stalledSince,
        queueSizeBytes,
        lastCheckedAt: now,
        alerts,
      });
    } catch {
      // Silently fail — health check is non-critical
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { ...health, isOffline, refresh: checkHealth };
}
