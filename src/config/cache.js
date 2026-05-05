// =============================================================
// FILE: src/config/cache.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Provides a simple, fast in-memory store to
//   reduce database load for frequent read operations.
// =============================================================
const cacheStore = new Map();
/**
 * Retrieves data from the cache if it hasn't expired.
 */
export function getCache(key) {
    const entry = cacheStore.get(key);
    if (!entry)
        return null;
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
export function setCache(key, data, ttlSeconds) {
    const expiry = Date.now() + ttlSeconds * 1000;
    cacheStore.set(key, { data, expiry });
}
/**
 * Clears specific keys or the entire store.
 * Call this during Create, Update, or Delete to prevent stale data.
 */
export function invalidateCache(key) {
    if (key) {
        cacheStore.delete(key);
    }
    else {
        cacheStore.clear();
    }
}
export const cache = {
    get: getCache,
    set: setCache,
    clear: invalidateCache
};
//# sourceMappingURL=cache.js.map