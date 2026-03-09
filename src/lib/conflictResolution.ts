/**
 * Conflict Resolution System for offline sync
 * Detects and resolves conflicts between client and server data
 */

import { QueuedMutation, getData, OfflineDataType } from './offlineStorage';

export type ConflictStrategy = 'client-wins' | 'server-wins' | 'merge' | 'manual';

export interface ConflictInfo {
  mutationId: string;
  table: OfflineDataType;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  conflictFields: string[];
  detectedAt: number;
  resolved: boolean;
  strategy: ConflictStrategy;
}

export interface MergeResult {
  merged: Record<string, unknown>;
  conflicts: string[];
  autoResolved: string[];
}

// Fields that should never be merged (always use server version)
const SERVER_AUTHORITY_FIELDS = new Set([
  'id', 'created_at', 'user_id', 'outlet_id',
]);

// Fields where client version takes priority
const CLIENT_PRIORITY_FIELDS = new Set([
  'status', 'notes', 'items', 'total_amount',
  'customer_name', 'customer_email', 'customer_phone',
  'payment_method', 'table_number',
]);

// Timestamp fields used for version comparison
const TIMESTAMP_FIELDS = ['updated_at', 'created_at'];

/**
 * Detect if there's a conflict between local mutation and server state
 */
export function detectConflict(
  localData: Record<string, unknown>,
  serverData: Record<string, unknown>,
  lastSyncTimestamp: number
): ConflictInfo | null {
  const serverUpdatedAt = serverData.updated_at
    ? new Date(serverData.updated_at as string).getTime()
    : 0;

  // If server data was updated after our last sync, there's a potential conflict
  if (serverUpdatedAt <= lastSyncTimestamp) {
    return null; // No conflict
  }

  const conflictFields: string[] = [];

  for (const key of Object.keys(localData)) {
    if (SERVER_AUTHORITY_FIELDS.has(key) || TIMESTAMP_FIELDS.includes(key)) continue;
    if (localData[key] !== undefined && serverData[key] !== undefined) {
      if (JSON.stringify(localData[key]) !== JSON.stringify(serverData[key])) {
        conflictFields.push(key);
      }
    }
  }

  if (conflictFields.length === 0) return null;

  return {
    mutationId: (localData.id as string) || '',
    table: '' as OfflineDataType,
    localData,
    serverData,
    conflictFields,
    detectedAt: Date.now(),
    resolved: false,
    strategy: 'merge',
  };
}

/**
 * Resolve conflict using client-wins strategy
 */
export function resolveClientWins(
  localData: Record<string, unknown>,
  serverData: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...serverData };

  for (const key of Object.keys(localData)) {
    if (SERVER_AUTHORITY_FIELDS.has(key)) continue;
    if (localData[key] !== undefined) {
      result[key] = localData[key];
    }
  }

  result.updated_at = new Date().toISOString();
  return result;
}

/**
 * Resolve conflict using server-wins strategy
 */
export function resolveServerWins(
  _localData: Record<string, unknown>,
  serverData: Record<string, unknown>
): Record<string, unknown> {
  return { ...serverData };
}

/**
 * Resolve conflict using smart merge strategy
 * - Server authority fields → server version
 * - Client priority fields → client version
 * - Other fields → most recent version
 */
export function resolveMerge(
  localData: Record<string, unknown>,
  serverData: Record<string, unknown>,
  localTimestamp: number
): MergeResult {
  const merged: Record<string, unknown> = { ...serverData };
  const conflicts: string[] = [];
  const autoResolved: string[] = [];

  const serverUpdatedAt = serverData.updated_at
    ? new Date(serverData.updated_at as string).getTime()
    : 0;

  for (const key of Object.keys(localData)) {
    if (SERVER_AUTHORITY_FIELDS.has(key)) continue;
    if (TIMESTAMP_FIELDS.includes(key)) continue;

    const localVal = localData[key];
    const serverVal = serverData[key];
    const hasLocalChange = localVal !== undefined;
    const valuesMatch = JSON.stringify(localVal) === JSON.stringify(serverVal);

    if (valuesMatch || !hasLocalChange) continue;

    if (CLIENT_PRIORITY_FIELDS.has(key)) {
      // Client-priority fields: use client version
      merged[key] = localVal;
      autoResolved.push(key);
    } else if (localTimestamp > serverUpdatedAt) {
      // Local change is more recent
      merged[key] = localVal;
      autoResolved.push(key);
    } else {
      // Server change is more recent, keep server version
      conflicts.push(key);
    }
  }

  merged.updated_at = new Date().toISOString();

  return { merged, conflicts, autoResolved };
}

/**
 * Apply the appropriate conflict resolution strategy
 */
export function resolveConflict(
  mutation: QueuedMutation,
  serverData: Record<string, unknown>
): Record<string, unknown> {
  switch (mutation.conflictResolution) {
    case 'client-wins':
      return resolveClientWins(mutation.data, serverData);
    case 'server-wins':
      return resolveServerWins(mutation.data, serverData);
    default: {
      const result = resolveMerge(mutation.data, serverData, mutation.timestamp);
      return result.merged;
    }
  }
}

/**
 * Merge arrays of items (e.g., order items, invoice items)
 * Uses ID-based deduplication with most-recent-wins
 */
export function mergeItemArrays(
  localItems: Record<string, unknown>[],
  serverItems: Record<string, unknown>[]
): Record<string, unknown>[] {
  const itemMap = new Map<string, Record<string, unknown>>();

  // Add server items first
  for (const item of serverItems) {
    const id = (item.id as string) || JSON.stringify(item);
    itemMap.set(id, item);
  }

  // Override with local items
  for (const item of localItems) {
    const id = (item.id as string) || JSON.stringify(item);
    itemMap.set(id, item);
  }

  return Array.from(itemMap.values());
}
