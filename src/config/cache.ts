// =============================================================
// FILE: src/config/cache.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Provides a simple, fast in-memory store to
//   reduce database load for frequent read operations.
// =============================================================

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Retrieves data from the cache if it hasn't expired.
 */
export function getCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);

  if (!entry) return null;

  // Check if current time has passed the expiry timestamp
  if (Date.now() > entry.expiry) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Saves data to the cache with a Time-To-Live (TTL).
 */
export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  const expiry = Date.now() + ttlSeconds * 1000;
  cacheStore.set(key, { data, expiry });
}

/**
 * Clears specific keys or the entire store.
 * Call this during Create, Update, or Delete to prevent stale data.
 */
export function invalidateCache(key?: string): void {
  if (key) {
    cacheStore.delete(key);
  } else {
    cacheStore.clear();
  }
}

export const cache = {
  get: getCache,
  set: setCache,
  clear: invalidateCache
};