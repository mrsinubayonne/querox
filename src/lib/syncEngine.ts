import { supabase } from '@/integrations/supabase/client';
import { QueuedMutation, getPendingMutations, getFailedMutations, updateMutation, storeIdMapping, isLocalId, getServerIdForLocalId, OfflineDataType, setLastSyncTime, getStorageStats, clearSyncedMutations, generateLocalId } from './offlineStorage';
import { resolveConflict, detectConflict } from './conflictResolution';

export interface SyncResult { success: boolean; synced: number; failed: number; errors: string[]; }
export interface SyncStatus { isSyncing: boolean; lastSyncTime: Date | null; pendingCount: number; failedCount: number; progress: number; }

type SyncStatusListener = (status: SyncStatus) => void;

class SyncEngine {
  private static instance: SyncEngine;
  private isSyncing = false;
  private lastSyncTime: Date | null = null;
  private listeners: Set<SyncStatusListener> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private currentProgress = 0;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.startBackgroundSync());
      window.addEventListener('offline', () => this.stopBackgroundSync());
      if (navigator.onLine) this.startBackgroundSync();
    }
  }

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) SyncEngine.instance = new SyncEngine();
    return SyncEngine.instance;
  }

  subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners(): Promise<void> {
    const stats = await getStorageStats();
    const status: SyncStatus = { isSyncing: this.isSyncing, lastSyncTime: this.lastSyncTime, pendingCount: stats.pendingCount, failedCount: stats.failedCount, progress: this.currentProgress };
    this.listeners.forEach(l => l(status));
  }

  startBackgroundSync(intervalMs = 30000): void {
    if (this.syncInterval) return;
    this.sync();
    this.syncInterval = setInterval(() => { if (navigator.onLine && !this.isSyncing) this.sync(); }, intervalMs);
  }

  stopBackgroundSync(): void {
    if (this.syncInterval) { clearInterval(this.syncInterval); this.syncInterval = null; }
  }

  async sync(): Promise<SyncResult> {
    if (this.isSyncing) return { success: false, synced: 0, failed: 0, errors: ['Sync in progress'] };
    if (!navigator.onLine) return { success: false, synced: 0, failed: 0, errors: ['Offline'] };

    this.isSyncing = true; this.currentProgress = 0; await this.notifyListeners();
    const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

    try {
      const pending = await getPendingMutations();
      if (pending.length === 0) { this.lastSyncTime = new Date(); this.isSyncing = false; this.currentProgress = 100; await this.notifyListeners(); return result; }

      for (let i = 0; i < pending.length; i++) {
        const m = pending[i];
        try {
          await this.processMutation(m);
          result.synced++;
          await updateMutation(m.id, { synced: true });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Error';
          result.errors.push(`${m.table}: ${msg}`);
          if (m.retryCount + 1 >= m.maxRetries) { await updateMutation(m.id, { failed: true, retryCount: m.retryCount + 1, errorMessage: msg }); result.failed++; }
          else await updateMutation(m.id, { retryCount: m.retryCount + 1 });
        }
        this.currentProgress = Math.round(((i + 1) / pending.length) * 100);
        await this.notifyListeners();
      }
      await clearSyncedMutations();
      this.lastSyncTime = new Date();
      result.success = result.failed === 0;
    } catch (e) { result.success = false; result.errors.push(e instanceof Error ? e.message : 'Failed'); }

    this.isSyncing = false; await this.notifyListeners();
    return result;
  }

  private async processMutation(m: QueuedMutation): Promise<void> {
    const resolved = await this.resolveLocalIds(m.data);
    if (m.operation === 'insert') await this.processInsert(m.table, resolved, m.localId);
    else if (m.operation === 'update') await this.processUpdate(m.table, resolved);
    else if (m.operation === 'delete') await this.processDelete(m.table, resolved.id as string);
    await setLastSyncTime(m.table, Date.now());
  }

  private async processInsert(table: OfflineDataType, data: Record<string, unknown>, localId: string): Promise<void> {
    const insertData = { ...data }; if (isLocalId(insertData.id as string)) delete insertData.id;
    const { data: result, error } = await supabase.from(table).insert(insertData as never).select('id').single();
    if (error) throw error;
    if (result?.id) await storeIdMapping({ localId, serverId: result.id, table });
  }

  private async processUpdate(table: OfflineDataType, data: Record<string, unknown>): Promise<void> {
    let id = data.id as string;
    if (isLocalId(id)) { const mapped = await getServerIdForLocalId(id); if (!mapped) throw new Error('No server ID'); id = mapped; }
    const updateData = { ...data }; delete updateData.id;
    const { error } = await supabase.from(table).update(updateData as never).eq('id', id);
    if (error) throw error;
  }

  private async processDelete(table: OfflineDataType, id: string): Promise<void> {
    let serverId = id;
    if (isLocalId(id)) { const mapped = await getServerIdForLocalId(id); if (!mapped) return; serverId = mapped; }
    const { error } = await supabase.from(table).delete().eq('id', serverId);
    if (error) throw error;
  }

  private async resolveLocalIds(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const resolved = { ...data };
    const fkFields = ['order_id', 'invoice_id', 'session_id', 'customer_id', 'debtor_id', 'menu_id', 'category_id', 'item_id', 'business_customer_id', 'outlet_id', 'supplier_id'];
    for (const f of fkFields) { const v = resolved[f]; if (typeof v === 'string' && isLocalId(v)) { const s = await getServerIdForLocalId(v); if (s) resolved[f] = s; } }
    return resolved;
  }

  async forceSync(): Promise<SyncResult> { this.stopBackgroundSync(); const r = await this.sync(); this.startBackgroundSync(); return r; }
  async getStatus(): Promise<SyncStatus> { const s = await getStorageStats(); return { isSyncing: this.isSyncing, lastSyncTime: this.lastSyncTime, pendingCount: s.pendingCount, failedCount: s.failedCount, progress: this.currentProgress }; }
  async retryFailed(): Promise<SyncResult> {
    const failedMutations = await getFailedMutations();
    for (const m of failedMutations) await updateMutation(m.id, { failed: false, retryCount: 0, errorMessage: undefined });
    return this.sync();
  }
}

export const syncEngine = SyncEngine.getInstance();
export { generateLocalId };
