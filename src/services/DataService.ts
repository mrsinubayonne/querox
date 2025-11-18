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
    try {
      const { data, error } = await supabase
        .from(store as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Erreur get ${store}:`, error);
      throw error;
    }
  }

  async getAll<T>(store: StoreName, filters?: Record<string, any>): Promise<T[]> {
    // Mode en ligne prioritaire - pas de fallback IndexedDB
    try {
      const { data, error } = await supabase
        .from(store as any)
        .select('*')
        .match(filters || {});
      
      if (error) throw error;
      return (data || []) as T[];
    } catch (error) {
      console.error(`Erreur Supabase pour ${store}:`, error);
      throw error;
    }
  }

  async create<T>(store: StoreName, data: Partial<T> & { id?: string }): Promise<T> {
    const id = data.id || uuidv4();
    const itemData = { ...data, id } as T;
    
    // Mode en ligne uniquement
    try {
      const { data: result, error } = await supabase
        .from(store as any)
        .insert(itemData as any)
        .select()
        .single();
      
      if (error) throw error;
      return result as T;
    } catch (error) {
      console.error(`Erreur création ${store}:`, error);
      throw error;
    }
  }

  async update<T>(store: StoreName, id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(store as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Erreur mise à jour ${store}:`, error);
      throw error;
    }
  }

  async delete(store: StoreName, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(store as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Erreur suppression ${store}:`, error);
      throw error;
    }
  }

  // Méthodes de cache locale (non utilisées en mode online pur)
  async saveOne(store: StoreName, data: any): Promise<void> {
    try {
      const db = await getDB();
      await db.put(store as any, {
        id: data.id,
        data,
        status: 'synced',
        lastSync: new Date()
      });
    } catch (error) {
      console.warn('Cache local non disponible:', error);
    }
  }

  async saveAll(store: StoreName, items: any[]): Promise<void> {
    try {
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
    } catch (error) {
      console.warn('Cache local non disponible:', error);
    }
  }

  async cleanupOldData(days: number = 7): Promise<void> {
    try {
      const db = await getDB();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const stores: StoreName[] = ['orders', 'invoices', 'table_sessions'];
      
      for (const store of stores) {
        try {
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
        } catch (storeError) {
          console.warn(`Impossible de nettoyer ${store}:`, storeError);
        }
      }
      
      console.log(`🧹 Nettoyage des données > ${days} jours effectué`);
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }
}

export const dataService = DataService.getInstance();
