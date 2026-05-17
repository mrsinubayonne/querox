/**
 * Safe, typed wrapper around window.localStorage.
 *
 * - `localStore.*`     → prefixed with `querox_` (recommended for new keys)
 * - `localStore.raw.*` → no prefix (used only for legacy keys that are read /
 *   written from many places across the codebase and cannot be renamed without
 *   a wider migration, e.g. `teamMember`, `selectedOutletId`, `outlet_cache`).
 *
 * All methods are exception-safe and SSR-safe.
 */

const PREFIX = 'querox_';

interface TTLEnvelope<T> {
  value: T;
  expiresAt: number;
}

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function makeStore(prefix: string) {
  return {
    get<T>(key: string, fallback: T): T {
      if (!isBrowser()) return fallback;
      try {
        const raw = localStorage.getItem(prefix + key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },

    set<T>(key: string, value: T): void {
      if (!isBrowser()) return;
      try {
        localStorage.setItem(prefix + key, JSON.stringify(value));
      } catch {
        console.warn('[localStore] Failed to write key:', key);
      }
    },

    remove(key: string): void {
      if (!isBrowser()) return;
      try {
        localStorage.removeItem(prefix + key);
      } catch {
        /* noop */
      }
    },

    /**
     * Tolerant TTL reader:
     *  - If stored value is a TTL envelope, expiry is enforced.
     *  - If stored value is a legacy raw object, it is returned as-is
     *    (allows interop with other writers not yet migrated).
     */
    getWithTTL<T>(key: string, fallback: T): T {
      if (!isBrowser()) return fallback;
      try {
        const raw = localStorage.getItem(prefix + key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === 'object' &&
          'expiresAt' in parsed &&
          'value' in parsed &&
          typeof (parsed as TTLEnvelope<T>).expiresAt === 'number'
        ) {
          const env = parsed as TTLEnvelope<T>;
          if (Date.now() > env.expiresAt) {
            localStorage.removeItem(prefix + key);
            return fallback;
          }
          return env.value;
        }
        // Legacy shape — return as-is
        return parsed as T;
      } catch {
        return fallback;
      }
    },

    setWithTTL<T>(key: string, value: T, ttlMs: number): void {
      if (!isBrowser()) return;
      try {
        const envelope: TTLEnvelope<T> = { value, expiresAt: Date.now() + ttlMs };
        localStorage.setItem(prefix + key, JSON.stringify(envelope));
      } catch {
        console.warn('[localStore] Failed to write key with TTL:', key);
      }
    },
  };
}

const prefixed = makeStore(PREFIX);
const raw = makeStore('');

export const localStore = {
  ...prefixed,
  /** Escape hatch for shared/legacy keys read by multiple files. */
  raw,
};
