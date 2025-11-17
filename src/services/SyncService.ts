import { getDB } from '@/lib/offlineDB';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface SyncQueueItem {
  id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: Date;
  retries: number;
}

class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async addToQueue(action: 'INSERT' | 'UPDATE' | 'DELETE', table: string, data: any): Promise<void> {
    const db = await getDB();
    const queueItem: SyncQueueItem = {
      id: uuidv4(),
      action,
      table,
      data,
      timestamp: new Date(),
      retries: 0
    };
    
    await db.add('sync_queue', queueItem);
    console.log(`📥 Ajouté à la file de sync: ${action} ${table}`, data.id);
    
    this.notifyListeners({ status: 'queued', itemCount: await this.getQueueCount() });
  }

  async syncAll(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners({ status: 'syncing', itemCount: await this.getQueueCount() });
    
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    try {
      const db = await getDB();
      const queue = await db.getAll('sync_queue');
      
      console.log(`🔄 Début de la synchronisation: ${queue.length} élément(s)`);

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await db.delete('sync_queue', item.id);
          successCount++;
          console.log(`✅ Synchronisé: ${item.action} ${item.table}`, item.data.id);
        } catch (error) {
          console.error(`❌ Échec sync: ${item.action} ${item.table}`, error);
          errorCount++;
          
          // Incrémenter le compteur de tentatives
          const updatedItem = { ...item, retries: item.retries + 1 };
          await db.put('sync_queue', updatedItem);
          
          // Abandonner après 5 tentatives
          if (updatedItem.retries >= 5) {
            console.error('🚫 Abandon après 5 tentatives:', item);
            await this.logSyncEvent({
              type: 'error',
              table: item.table,
              itemCount: 1,
              duration: 0,
              error: `Échec après ${updatedItem.retries} tentatives`
            });
            await db.delete('sync_queue', item.id);
          }
        }
      }

      const duration = Date.now() - startTime;
      
      if (successCount > 0) {
        await this.logSyncEvent({
          type: 'success',
          table: 'multiple',
          itemCount: successCount,
          duration
        });
      }

      console.log(`✨ Synchronisation terminée: ${successCount} réussie(s), ${errorCount} échec(s) en ${duration}ms`);
      
      this.notifyListeners({ 
        status: errorCount > 0 ? 'error' : 'success', 
        itemCount: await this.getQueueCount() 
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { action, table, data } = item;
    
    switch (action) {
      case 'INSERT':
        const { error: insertError } = await supabase.from(table as any).insert(data);
        if (insertError) throw insertError;
        break;
        
      case 'UPDATE':
        const { error: updateError } = await supabase
          .from(table as any)
          .update(data)
          .eq('id', data.id);
        if (updateError) throw updateError;
        break;
        
      case 'DELETE':
        const { error: deleteError } = await supabase
          .from(table as any)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  async getQueueCount(): Promise<number> {
    const db = await getDB();
    const queue = await db.getAll('sync_queue');
    return queue.length;
  }

  async getQueueItems(): Promise<SyncQueueItem[]> {
    const db = await getDB();
    return await db.getAll('sync_queue');
  }

  async clearQueue(): Promise<void> {
    const db = await getDB();
    await db.clear('sync_queue');
    console.log('🗑️ File de synchronisation vidée');
    this.notifyListeners({ status: 'cleared', itemCount: 0 });
  }

  startAutoSync(intervalSeconds: number = 30): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    this.autoSyncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, intervalSeconds * 1000);

    console.log(`⏰ Synchronisation automatique démarrée (toutes les ${intervalSeconds}s)`);
  }

  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      console.log('⏸️ Synchronisation automatique arrêtée');
    }
  }

  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  private async logSyncEvent(event: {
    type: 'success' | 'error' | 'conflict';
    table: string;
    itemCount: number;
    duration: number;
    error?: string;
  }): Promise<void> {
    const db = await getDB();
    await db.add('sync_logs', {
      id: uuidv4(),
      timestamp: new Date(),
      ...event
    });
  }

  async getSyncLogs(limit: number = 50): Promise<any[]> {
    const db = await getDB();
    const logs = await db.getAll('sync_logs');
    return logs.slice(-limit).reverse();
  }
}

export interface SyncStatus {
  status: 'queued' | 'syncing' | 'success' | 'error' | 'cleared';
  itemCount: number;
}

export const syncService = SyncService.getInstance();
