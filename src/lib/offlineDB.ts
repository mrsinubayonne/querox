import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QueroxDB extends DBSchema {
  menus: {
    key: string;
    value: {
      id: string;
      data: any;
      lastSync: Date;
      version: number;
    };
    indexes: { 'by-lastSync': Date };
  };
  menu_categories: {
    key: string;
    value: {
      id: string;
      menu_id: string;
      data: any;
      lastSync: Date;
    };
    indexes: { 'by-menu': string; 'by-lastSync': Date };
  };
  menu_items: {
    key: string;
    value: {
      id: string;
      category_id: string;
      data: any;
      lastSync: Date;
    };
    indexes: { 'by-category': string; 'by-lastSync': Date };
  };
  orders: {
    key: string;
    value: {
      id: string;
      data: any;
      status: 'pending' | 'synced';
      createdAt: Date;
      syncedAt?: Date;
    };
    indexes: { 'by-status': string; 'by-createdAt': Date };
  };
  customers: {
    key: string;
    value: {
      id: string;
      data: any;
      lastSync: Date;
    };
    indexes: { 'by-lastSync': Date };
  };
  invoices: {
    key: string;
    value: {
      id: string;
      data: any;
      status: 'pending' | 'synced';
      lastSync: Date;
    };
    indexes: { 'by-status': string; 'by-lastSync': Date };
  };
  table_sessions: {
    key: string;
    value: {
      id: string;
      data: any;
      status: 'pending' | 'synced';
      lastSync: Date;
    };
    indexes: { 'by-status': string; 'by-lastSync': Date };
  };
  inventory: {
    key: string;
    value: {
      id: string;
      data: any;
      lastSync: Date;
    };
    indexes: { 'by-lastSync': Date };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
      lastSync: Date;
    };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'INSERT' | 'UPDATE' | 'DELETE';
      table: string;
      data: any;
      timestamp: Date;
      retries: number;
    };
    indexes: { 'by-timestamp': Date; 'by-retries': number };
  };
  sync_logs: {
    key: string;
    value: {
      id: string;
      timestamp: Date;
      type: 'success' | 'error' | 'conflict';
      table: string;
      itemCount: number;
      duration: number;
      error?: string;
    };
    indexes: { 'by-timestamp': Date; 'by-type': string };
  };
}

const DB_NAME = 'querox-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<QueroxDB> | null = null;

export const initDB = async (): Promise<IDBPDatabase<QueroxDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<QueroxDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Menus store
      if (!db.objectStoreNames.contains('menus')) {
        const menusStore = db.createObjectStore('menus', { keyPath: 'id' });
        menusStore.createIndex('by-lastSync', 'lastSync');
      }

      // Menu categories store
      if (!db.objectStoreNames.contains('menu_categories')) {
        const categoriesStore = db.createObjectStore('menu_categories', { keyPath: 'id' });
        categoriesStore.createIndex('by-menu', 'menu_id');
        categoriesStore.createIndex('by-lastSync', 'lastSync');
      }

      // Menu items store
      if (!db.objectStoreNames.contains('menu_items')) {
        const itemsStore = db.createObjectStore('menu_items', { keyPath: 'id' });
        itemsStore.createIndex('by-category', 'category_id');
        itemsStore.createIndex('by-lastSync', 'lastSync');
      }

      // Orders store
      if (!db.objectStoreNames.contains('orders')) {
        const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
        ordersStore.createIndex('by-status', 'status');
        ordersStore.createIndex('by-createdAt', 'createdAt');
      }

      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const customersStore = db.createObjectStore('customers', { keyPath: 'id' });
        customersStore.createIndex('by-lastSync', 'lastSync');
      }

      // Invoices store
      if (!db.objectStoreNames.contains('invoices')) {
        const invoicesStore = db.createObjectStore('invoices', { keyPath: 'id' });
        invoicesStore.createIndex('by-status', 'status');
        invoicesStore.createIndex('by-lastSync', 'lastSync');
      }

      // Table sessions store
      if (!db.objectStoreNames.contains('table_sessions')) {
        const sessionsStore = db.createObjectStore('table_sessions', { keyPath: 'id' });
        sessionsStore.createIndex('by-status', 'status');
        sessionsStore.createIndex('by-lastSync', 'lastSync');
      }

      // Inventory store
      if (!db.objectStoreNames.contains('inventory')) {
        const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
        inventoryStore.createIndex('by-lastSync', 'lastSync');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        queueStore.createIndex('by-timestamp', 'timestamp');
        queueStore.createIndex('by-retries', 'retries');
      }

      // Sync logs store
      if (!db.objectStoreNames.contains('sync_logs')) {
        const logsStore = db.createObjectStore('sync_logs', { keyPath: 'id' });
        logsStore.createIndex('by-timestamp', 'timestamp');
        logsStore.createIndex('by-type', 'type');
      }
    },
  });

  return dbInstance;
};

export const getDB = async (): Promise<IDBPDatabase<QueroxDB>> => {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
};

export const clearDB = async (): Promise<void> => {
  const db = await getDB();
  const storeNames = db.objectStoreNames;
  
  const tx = db.transaction(Array.from(storeNames), 'readwrite');
  
  await Promise.all(
    Array.from(storeNames).map(storeName => 
      tx.objectStore(storeName).clear()
    )
  );
  
  await tx.done;
};

export const getStorageUsage = async (): Promise<{ usage: number; quota: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  }
  return { usage: 0, quota: 0 };
};
