import { QueuedMutation, getPendingMutations, getFailedMutations, getAllMutations } from './offlineStorage';

export type ConflictStrategy = 'client-wins' | 'server-wins' | 'merge' | 'manual';

export interface ConflictInfo {
  mutation: QueuedMutation;
  serverData: Record<string, unknown>;
  localData: Record<string, unknown>;
  conflictFields: string[];
}

export interface ConflictResolution {
  strategy: ConflictStrategy;
  resolvedData?: Record<string, unknown>;
}

/**
 * Detect conflicts between local mutation and server state
 */
export function detectConflicts(
  mutation: QueuedMutation,
  serverData: Record<string, unknown> | null
): ConflictInfo | null {
  if (!serverData) return null;
  if (mutation.operation === 'insert' || mutation.operation === 'delete') return null;

  const conflictFields: string[] = [];
  const localData = mutation.data;

  // Compare each field in the mutation data against server state
  for (const [key, localValue] of Object.entries(localData)) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
    
    const serverValue = serverData[key];
    
    // If both differ from original AND differ from each other → conflict
    if (serverValue !== undefined && localValue !== undefined && 
        JSON.stringify(serverValue) !== JSON.stringify(localValue)) {
      conflictFields.push(key);
    }
  }

  if (conflictFields.length === 0) return null;

  return {
    mutation,
    serverData,
    localData,
    conflictFields,
  };
}

/**
 * Resolve a conflict using the specified strategy
 */
export function resolveConflict(
  conflict: ConflictInfo,
  strategy: ConflictStrategy
): Record<string, unknown> {
  switch (strategy) {
    case 'client-wins':
      return { ...conflict.serverData, ...conflict.localData };
    
    case 'server-wins':
      return conflict.serverData;
    
    case 'merge':
      // Smart merge: use client values for conflict fields, keep server for rest
      const merged = { ...conflict.serverData };
      for (const [key, value] of Object.entries(conflict.localData)) {
        if (value !== undefined && value !== null) {
          merged[key] = value;
        }
      }
      return merged;
    
    case 'manual':
      // Return server data as default; manual resolution should be handled by UI
      return conflict.serverData;
    
    default:
      return conflict.localData;
  }
}

/**
 * Get sync queue health metrics
 */
export async function getSyncQueueHealth(): Promise<{
  totalMutations: number;
  pendingCount: number;
  failedCount: number;
  oldestPendingAge: number | null;
  healthStatus: 'healthy' | 'warning' | 'critical';
}> {
  const all = await getAllMutations();
  const pending = await getPendingMutations();
  const failed = await getFailedMutations();

  const oldestPending = pending.length > 0
    ? Math.min(...pending.map(m => m.timestamp))
    : null;

  const oldestPendingAge = oldestPending
    ? Date.now() - oldestPending
    : null;

  let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  if (failed.length > 5 || (oldestPendingAge && oldestPendingAge > 60 * 60 * 1000)) {
    healthStatus = 'critical';
  } else if (failed.length > 0 || pending.length > 20) {
    healthStatus = 'warning';
  }

  return {
    totalMutations: all.length,
    pendingCount: pending.length,
    failedCount: failed.length,
    oldestPendingAge,
    healthStatus,
  };
}

