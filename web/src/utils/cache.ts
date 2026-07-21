"use client";

interface CacheEntry<T> {
  promise: Promise<T> | null;
  data: T | null;
  timestamp: number;
}

const cache: Record<string, CacheEntry<any>> = {};

/**
 * Retrieves data from the cache, coalescing concurrent pending requests
 * to avoid duplicate API/database calls, and serving cached data if within the TTL.
 * 
 * @param key The unique identifier for the cached resource.
 * @param fetchFn The asynchronous loader function that fetches the data.
 * @param options Configuration for TTL (Time-To-Live) and forcing a fresh request.
 */
export const getCachedData = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: { ttl?: number; forceRefresh?: boolean }
): Promise<T> => {
  const ttl = options?.ttl ?? 15000; // Default TTL: 15 seconds
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();
  
  const entry = cache[key];

  if (!forceRefresh && entry && (now - entry.timestamp) < ttl) {
    if (entry.data !== null) {
      return entry.data;
    }
    if (entry.promise !== null) {
      return entry.promise;
    }
  }

  // Create a new active cache entry
  const newEntry: CacheEntry<T> = {
    promise: null,
    data: null,
    timestamp: now,
  };

  const promise = fetchFn()
    .then((data) => {
      newEntry.data = data;
      newEntry.promise = null;
      return data;
    })
    .catch((err) => {
      // Clear the cache entry on error so subsequent attempts can retry
      delete cache[key];
      throw err;
    });

  newEntry.promise = promise;
  cache[key] = newEntry;

  return promise;
};

/**
 * Invalidates a specific cache key.
 */
export const invalidateCache = (key: string): void => {
  delete cache[key];
};

/**
 * Clears the entire cache.
 */
export const clearCache = (): void => {
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });
};

// Automatically invalidate the cache if storage changes in another tab
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key) {
      invalidateCache(e.key);
    } else if (e.key === null) {
      clearCache();
    }
  });
}
