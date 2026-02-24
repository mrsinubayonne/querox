import { get, set, del, keys, clear, createStore } from 'idb-keyval';

// Create dedicated stores for different data types
const dataStore = createStore('querox-data', 'data-store');
const mutationStore = createStore('querox-mutations', 'mutation-store');
const authStore = createStore('querox-auth', 'auth-store');
const metaStore = createStore('querox-meta', 'meta-store');

// Data types that can be stored offline
export type OfflineDataType = 
  | 'orders'
  | 'table_sessions'
  | 'menu_items'
  | 'menu_categories'
  | 'menus'
  | 'outlets'
  | 'inventory_items'
  | 'invoices'
  | 'transactions'
  | 'business_customers'
  | 'reservations'
  | 'customers'
  | 'suppliers'
  | 'invoice_settings'
  | 'business_periods'
  | 'stock_movements'
  | 'debtor_payments'
  | 'events';

export interface StoredData<T> {
  data: T;
  timestamp: number;
  userId: string;
  outletId?: string;
}

export interface SyncMetadata {
  lastSyncTime: Record<OfflineDataType, number>;
  pendingMutationsCount: number;
  failedMutationsCount: number;
}

// ============= DATA STORAGE =============

export async function storeData<T>(
  type: OfflineDataType,
  data: T,
  userId: string,
  outletId?: string
): Promise<void> {
  const key = outletId ? `${type}:${userId}:${outletId}` : `${type}:${userId}`;
  const storedData: StoredData<T> = {
    data,
    timestamp: Date.now(),
    userId,
    outletId,
  };
  await set(key, storedData, dataStore);
}

export async function getData<T>(
  type: OfflineDataType,
  userId: string,
  outletId?: string
): Promise<StoredData<T> | undefined> {
  const key = outletId ? `${type}:${userId}:${outletId}` : `${type}:${userId}`;
  return get(key, dataStore);
}

export async function removeData(
  type: OfflineDataType,
  userId: string,
  outletId?: string
): Promise<void> {
  const key = outletId ? `${type}:${userId}:${outletId}` : `${type}:${userId}`;
  await del(key, dataStore);
}

export async function clearAllData(): Promise<void> {
  await clear(dataStore);
}

// ============= MUTATION QUEUE =============

export interface QueuedMutation {
  id: string;
  timestamp: number;
  table: OfflineDataType;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  localId: string;
  serverId?: string;
  userId: string;
  outletId?: string;
  retryCount: number;
  maxRetries: number;
  synced: boolean;
  failed: boolean;
  errorMessage?: string;
  conflictResolution: 'client-wins' | 'server-wins' | 'manual';
}

export async function queueMutation(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'synced' | 'failed'>): Promise<string> {
  const id = `mut_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const fullMutation: QueuedMutation = {
    ...mutation,
    id,
    timestamp: Date.now(),
    retryCount: 0,
    synced: false,
    failed: false,
  };
  await set(id, fullMutation, mutationStore);
  return id;
}

export async function getMutation(id: string): Promise<QueuedMutation | undefined> {
  return get(id, mutationStore);
}

export async function updateMutation(id: string, updates: Partial<QueuedMutation>): Promise<void> {
  const existing = await getMutation(id);
  if (existing) {
    await set(id, { ...existing, ...updates }, mutationStore);
  }
}

export async function deleteMutation(id: string): Promise<void> {
  await del(id, mutationStore);
}

export async function getAllMutations(): Promise<QueuedMutation[]> {
  const allKeys = await keys(mutationStore);
  const mutations: QueuedMutation[] = [];
  for (const key of allKeys) {
    const mutation = await get<QueuedMutation>(key, mutationStore);
    if (mutation) {
      mutations.push(mutation);
    }
  }
  return mutations.sort((a, b) => a.timestamp - b.timestamp);
}

export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const all = await getAllMutations();
  return all.filter(m => !m.synced && !m.failed);
}

export async function getFailedMutations(): Promise<QueuedMutation[]> {
  const all = await getAllMutations();
  return all.filter(m => m.failed);
}

export async function clearSyncedMutations(): Promise<void> {
  const all = await getAllMutations();
  for (const mutation of all) {
    if (mutation.synced) {
      await del(mutation.id, mutationStore);
    }
  }
}

export async function clearAllMutations(): Promise<void> {
  await clear(mutationStore);
}

// ============= AUTH STORAGE =============

export interface OfflineAuthData {
  user: Record<string, unknown>;
  userId?: string;
  email?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  userMetadata?: Record<string, unknown>;
  cachedAt?: number;
}

export async function storeAuthData(auth: OfflineAuthData): Promise<void> {
  await set('auth_session', auth, authStore);
}

export async function getAuthData(): Promise<OfflineAuthData | undefined> {
  return get('auth_session', authStore);
}

export async function clearAuthData(): Promise<void> {
  await del('auth_session', authStore);
}

// ============= METADATA STORAGE =============

export async function getSyncMetadata(): Promise<SyncMetadata> {
  const meta = await get<SyncMetadata>('sync_metadata', metaStore);
  return meta || {
    lastSyncTime: {} as Record<OfflineDataType, number>,
    pendingMutationsCount: 0,
    failedMutationsCount: 0,
  };
}

export async function updateSyncMetadata(updates: Partial<SyncMetadata>): Promise<void> {
  const current = await getSyncMetadata();
  await set('sync_metadata', { ...current, ...updates }, metaStore);
}

export async function setLastSyncTime(type: OfflineDataType, time: number): Promise<void> {
  const meta = await getSyncMetadata();
  meta.lastSyncTime[type] = time;
  await updateSyncMetadata(meta);
}

export async function getLastSyncTime(type: OfflineDataType): Promise<number> {
  const meta = await getSyncMetadata();
  return meta.lastSyncTime[type] || 0;
}

// ============= LOCAL ID MAPPING =============

const idMappingKey = 'id_mappings';

export interface IdMapping {
  localId: string;
  serverId: string;
  table: OfflineDataType;
  createdAt: number;
}

export async function storeIdMapping(mapping: Omit<IdMapping, 'createdAt'>): Promise<void> {
  const mappings = await getIdMappings();
  mappings.push({ ...mapping, createdAt: Date.now() });
  await set(idMappingKey, mappings, metaStore);
}

export async function getIdMappings(): Promise<IdMapping[]> {
  return (await get<IdMapping[]>(idMappingKey, metaStore)) || [];
}

export async function getServerIdForLocalId(localId: string): Promise<string | undefined> {
  const mappings = await getIdMappings();
  const mapping = mappings.find(m => m.localId === localId);
  return mapping?.serverId;
}

export async function getLocalIdForServerId(serverId: string): Promise<string | undefined> {
  const mappings = await getIdMappings();
  const mapping = mappings.find(m => m.serverId === serverId);
  return mapping?.localId;
}

export async function clearOldIdMappings(maxAgeDays: number = 7): Promise<void> {
  const mappings = await getIdMappings();
  const cutoff = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
  const filtered = mappings.filter(m => m.createdAt > cutoff);
  await set(idMappingKey, filtered, metaStore);
}

// ============= UTILITY FUNCTIONS =============

export function generateLocalId(): string {
  return crypto.randomUUID();
}

export function isLocalId(id: string): boolean {
  return id.startsWith('local_');
}

export async function getStorageStats(): Promise<{
  dataCount: number;
  mutationCount: number;
  pendingCount: number;
  failedCount: number;
}> {
  const dataKeys = await keys(dataStore);
  const mutations = await getAllMutations();
  const pending = mutations.filter(m => !m.synced && !m.failed);
  const failed = mutations.filter(m => m.failed);
  
  return {
    dataCount: dataKeys.length,
    mutationCount: mutations.length,
    pendingCount: pending.length,
    failedCount: failed.length,
  };
}

// Clear everything on logout
export async function clearAllOfflineData(): Promise<void> {
  await Promise.all([
    clear(dataStore),
    clear(mutationStore),
    clear(authStore),
    clear(metaStore),
  ]);
}
