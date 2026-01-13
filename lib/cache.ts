import { getFirestoreInstance } from './firebase';

const CACHE_TTL = 600; // 10 minutes in seconds

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

export const getCacheKey = (sport: string, region: string, market: string): string => {
  return `odds_${sport}_${region}_${market}`;
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const db = getFirestoreInstance();
    const doc = await db.collection('odds_cache').doc(key).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const cacheData = doc.data() as CacheEntry<T>;
    const now = Date.now();
    
    // Check if cache is still valid
    if (cacheData.expiresAt > now) {
      return cacheData.data;
    }
    
    // Cache expired but return it anyway for fallback
    return cacheData.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

export const setCachedData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const now = Date.now();
    const expiresAt = now + (CACHE_TTL * 1000);
    
    const cacheEntry: CacheEntry<T> = {
      data,
      expiresAt,
      createdAt: now,
    };
    
    await db.collection('odds_cache').doc(key).set(cacheEntry);
  } catch (error) {
    console.error('Error writing to cache:', error);
    // Don't throw - caching failures shouldn't break the API
  }
};

export const isCacheValid = async (key: string): Promise<boolean> => {
  try {
    const db = getFirestoreInstance();
    const doc = await db.collection('odds_cache').doc(key).get();
    
    if (!doc.exists) {
      return false;
    }
    
    const cacheData = doc.data() as CacheEntry<unknown>;
    return cacheData.expiresAt > Date.now();
  } catch (error) {
    return false;
  }
};
