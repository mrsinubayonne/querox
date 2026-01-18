import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

const CACHE_KEY = 'querox-react-query-cache';

export function createIDBPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(CACHE_KEY, client);
      } catch (error) {
        console.error('[IDBPersister] Error persisting client:', error);
      }
    },
    restoreClient: async () => {
      try {
        return await get<PersistedClient>(CACHE_KEY);
      } catch (error) {
        console.error('[IDBPersister] Error restoring client:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(CACHE_KEY);
      } catch (error) {
        console.error('[IDBPersister] Error removing client:', error);
      }
    },
  };
}
