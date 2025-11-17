import { getDB } from '@/lib/offlineDB';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

type StoreName = 'menus' | 'menu_categories' | 'menu_items' | 'orders' | 'customers' | 'invoices' | 'table_sessions' | 'inventory' | 'settings' | 'reservations' | 'events' | 'business_periods';

class DataService {
  private static instance: DataService;

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async get<T>(store: StoreName, id: string): Promise<T | undefined> {
    const db = await getDB();
    const result = await db.get(store as any, id);
    return result?.data as T;
  }

  async getAll<T>(store: StoreName, filters?: Record<string, any>): Promise<T[]> {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      // Essayer de récupérer depuis Supabase
      try {
        const { data, error } = await supabase
          .from(store as any)
          .select('*')
          .match(filters || {});
        
        if (!error && data) {
          // Sauvegarder dans IndexedDB
          await this.saveAll(store, data);
          return data as T[];
        }
      } catch (error) {
        console.error(`Erreur Supabase pour ${store}:`, error);
      }
    }
    
    // Charger depuis IndexedDB (fallback ou mode offline)
    const db = await getDB();
    const allItems = await db.getAll(store as any);
    
    if (!filters) {
      return allItems.map(item => item.data) as T[];
    }
    
    // Appliquer les filtres localement
    return allItems
      .filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return item.data[key] === value;
        });
      })
      .map(item => item.data) as T[];
  }

  async create<T>(store: StoreName, data: Partial<T> & { id?: string }): Promise<T> {
    const id = data.id || uuidv4();
    const itemData = { ...data, id } as T;
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        const { data: result, error } = await supabase
          .from(store as any)
          .insert(itemData as any)
          .select()
          .single();
        
        if (!error && result) {
          await this.saveOne(store, result);
          return result as T;
        }
      } catch (error) {
        console.error(`Erreur création Supabase pour ${store}:`, error);
      }
    }
    
    // Mode offline : sauvegarder localement
    const db = await getDB();
    await db.put(store as any, {
      id,
      data: itemData,
      status: 'pending',
      createdAt: new Date(),
      lastSync: new Date()
    });
    
    return itemData;
  }

  async update<T>(store: StoreName, id: string, updates: Partial<T>): Promise<T | null> {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from(store as any)
          .update(updates as any)
          .eq('id', id)
          .select()
          .single();
        
        if (!error && data) {
          await this.saveOne(store, data);
          return data as T;
        }
      } catch (error) {
        console.error(`Erreur mise à jour Supabase pour ${store}:`, error);
      }
    }
    
    // Mode offline : mettre à jour localement
    const db = await getDB();
    const existing = await db.get(store as any, id);
    
    if (existing) {
      const updatedData = { ...existing.data, ...updates };
      await db.put(store as any, {
        ...existing,
        data: updatedData,
        status: 'pending',
        lastSync: new Date()
      });
      return updatedData as T;
    }
    
    return null;
  }

  async delete(store: StoreName, id: string): Promise<void> {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        await supabase.from(store as any).delete().eq('id', id);
      } catch (error) {
        console.error(`Erreur suppression Supabase pour ${store}:`, error);
      }
    }
    
    // Supprimer localement
    const db = await getDB();
    await db.delete(store as any, id);
  }

  async saveOne(store: StoreName, data: any): Promise<void> {
    const db = await getDB();
    await db.put(store as any, {
      id: data.id,
      data,
      status: 'synced',
      lastSync: new Date()
    });
  }

  async saveAll(store: StoreName, items: any[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(store as any, 'readwrite');
    
    await Promise.all(
      items.map(item =>
        tx.store.put({
          id: item.id,
          data: item,
          status: 'synced',
          lastSync: new Date()
        })
      )
    );
    
    await tx.done;
  }

  async cleanupOldData(days: number = 7): Promise<void> {
    const db = await getDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const stores: StoreName[] = ['orders', 'invoices', 'table_sessions', 'reservations', 'events', 'business_periods'];
    
    for (const store of stores) {
      const tx = db.transaction(store as any, 'readwrite');
      const index = tx.store.index('by-lastSync');
      
      let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoffDate));
      
      while (cursor) {
        if (cursor.value.status === 'synced') {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      
      await tx.done;
    }
    
    console.log(`🧹 Nettoyage des données > ${days} jours effectué`);
  }
}

export const dataService = DataService.getInstance();
