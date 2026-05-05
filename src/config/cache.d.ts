/**
 * Retrieves data from the cache if it hasn't expired.
 */
export declare function getCache<T>(key: string): T | null;
/**
 * Saves data to the cache with a Time-To-Live (TTL).
 */
export declare function setCache<T>(key: string, data: T, ttlSeconds: number): void;
/**
 * Clears specific keys or the entire store.
 * Call this during Create, Update, or Delete to prevent stale data.
 */
export declare function invalidateCache(key?: string): void;
export declare const cache: {
    get: typeof getCache;
    set: typeof setCache;
    clear: typeof invalidateCache;
};
//# sourceMappingURL=cache.d.ts.map