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
      window.addEventListener('online', () => {
        console.log('[SyncEngine] Network online detected, starting sync...');
        this.startBackgroundSync();
        // Immediate sync on reconnection
        setTimeout(() => this.sync(), 1000);
      });
      window.addEventListener('offline', () => {
        console.log('[SyncEngine] Network offline detected');
        this.stopBackgroundSync();
      });
      // Sync when user returns to tab
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine && !this.isSyncing) {
          console.log('[SyncEngine] Tab visible, triggering sync...');
          this.sync();
        }
      });
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

  startBackgroundSync(intervalMs = 15000): void {
    if (this.syncInterval) return;
    this.sync();
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.sync().then(result => {
          // Auto-retry failed mutations every cycle
          if (result.failed > 0 || result.errors.length > 0) {
            console.log('[SyncEngine] Auto-retrying failed mutations...');
            this.retryFailed();
          }
        });
      }
    }, intervalMs);
  }

  stopBackgroundSync(): void {
    if (this.syncInterval) { clearInterval(this.syncInterval); this.syncInterval = null; }
  }

  private async ensureAuthSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.warn('[SyncEngine] No active session, attempting refresh...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('[SyncEngine] Auth refresh failed:', refreshError.message);
          return false;
        }
      }
      return true;
    } catch (e) {
      console.error('[SyncEngine] Auth check failed:', e);
      return false;
    }
  }

  async sync(): Promise<SyncResult> {
    if (this.isSyncing) return { success: false, synced: 0, failed: 0, errors: ['Sync in progress'] };
    if (!navigator.onLine) return { success: false, synced: 0, failed: 0, errors: ['Offline'] };

    // Quick check: skip heavy sync if nothing pending (no state change, no logs)
    const pending = await getPendingMutations();
    if (pending.length === 0) {
      this.lastSyncTime = new Date();
      await this.notifyListeners();
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    this.isSyncing = true; this.currentProgress = 0; await this.notifyListeners();
    const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

    try {
      console.log(`[SyncEngine] Starting sync: ${pending.length} pending mutations`);

      // Ensure we have a valid auth session before syncing
      const hasAuth = await this.ensureAuthSession();
      if (!hasAuth) {
        console.warn('[SyncEngine] Skipping sync - no valid auth session');
        this.isSyncing = false; await this.notifyListeners();
        return { success: false, synced: 0, failed: 0, errors: ['No auth session'] };
      }

      for (let i = 0; i < pending.length; i++) {
        const m = pending[i];
        try {
          await this.processMutation(m);
          result.synced++;
          await updateMutation(m.id, { synced: true });
          console.log(`[SyncEngine] ✅ Synced ${m.operation} on ${m.table} (${m.id})`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Error';
          console.error(`[SyncEngine] ❌ Failed ${m.operation} on ${m.table}:`, msg, JSON.stringify(m.data).slice(0, 200));
          result.errors.push(`${m.table}: ${msg}`);
          if (m.retryCount + 1 >= m.maxRetries) {
            await updateMutation(m.id, { failed: true, retryCount: m.retryCount + 1, errorMessage: msg });
            result.failed++;
          } else {
            await updateMutation(m.id, { retryCount: m.retryCount + 1 });
          }
        }
        this.currentProgress = Math.round(((i + 1) / pending.length) * 100);
        await this.notifyListeners();
      }
      await clearSyncedMutations();
      this.lastSyncTime = new Date();
      result.success = result.failed === 0;
      console.log(`[SyncEngine] Sync complete: ${result.synced} synced, ${result.failed} failed`);
    } catch (e) {
      result.success = false;
      const msg = e instanceof Error ? e.message : 'Failed';
      result.errors.push(msg);
      console.error('[SyncEngine] Sync error:', msg);
    }

    this.isSyncing = false; await this.notifyListeners();
    return result;
  }

  private async processMutation(m: QueuedMutation): Promise<void> {
    const resolved = await this.resolveLocalIds(m.data);
    if (m.operation === 'insert') await this.processInsert(m.table, resolved, m.localId);
    else if (m.operation === 'update') await this.processUpdate(m.table, resolved, m);
    else if (m.operation === 'delete') await this.processDelete(m.table, resolved.id as string);
    await setLastSyncTime(m.table, Date.now());
  }

  private async processInsert(table: OfflineDataType, data: Record<string, unknown>, localId: string): Promise<void> {
    const insertData = { ...data };
    if (isLocalId(insertData.id as string)) delete insertData.id;
    
    // Check if record already exists (avoid duplicate inserts on retry)
    const recordId = insertData.id as string | undefined;
    if (recordId) {
      const { data: existing } = await supabase.from(table).select('id').eq('id', recordId).maybeSingle();
      if (existing) {
        console.log(`[SyncEngine] Record ${recordId} already exists in ${table}, skipping insert`);
        await storeIdMapping({ localId, serverId: recordId, table });
        return;
      }
    }
    
    const { data: result, error } = await supabase.from(table).insert(insertData as never).select('id').single();
    if (error) {
      // Handle duplicate key error gracefully
      if (error.code === '23505') {
        console.log(`[SyncEngine] Duplicate key for ${table}, record already synced`);
        return;
      }
      throw error;
    }
    if (result?.id) await storeIdMapping({ localId, serverId: result.id, table });
  }

  private async processUpdate(table: OfflineDataType, data: Record<string, unknown>, mutation?: QueuedMutation): Promise<void> {
    let id = data.id as string;
    if (isLocalId(id)) { const mapped = await getServerIdForLocalId(id); if (!mapped) throw new Error('No server ID'); id = mapped; }
    
    // Fetch server data for conflict detection
    const { data: serverRow } = await supabase.from(table).select('*').eq('id', id).single();
    
    let updateData: Record<string, unknown>;
    if (serverRow && mutation) {
      const conflict = detectConflict(data, serverRow as Record<string, unknown>, mutation.timestamp);
      if (conflict) {
        updateData = resolveConflict(mutation, serverRow as Record<string, unknown>);
      } else {
        updateData = { ...data };
      }
    } else {
      updateData = { ...data };
    }
    
    delete updateData.id;
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
