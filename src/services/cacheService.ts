import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

/**
 * Cache service for optimizing Firebase queries and reducing redundant API calls
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly prefix = 'scbc_cache_';

  /**
   * Get data from cache (memory first, then AsyncStorage)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && this.isValid(memoryItem)) {
        logger.debug('Cache hit (memory)', { key });
        return memoryItem.data;
      }

      // Check AsyncStorage cache
      const storageKey = this.prefix + key;
      const storedData = await AsyncStorage.getItem(storageKey);
      
      if (storedData) {
        const cacheItem: CacheItem<T> = JSON.parse(storedData);
        
        if (this.isValid(cacheItem)) {
          // Restore to memory cache
          this.memoryCache.set(key, cacheItem);
          logger.debug('Cache hit (storage)', { key });
          return cacheItem.data;
        } else {
          // Remove expired item
          await AsyncStorage.removeItem(storageKey);
          this.memoryCache.delete(key);
        }
      }

      logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set data in cache (both memory and AsyncStorage)
   */
  async set<T>(key: string, data: T, ttlMinutes: number = 5): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      };

      // Set in memory cache
      this.memoryCache.set(key, cacheItem);

      // Set in AsyncStorage
      const storageKey = this.prefix + key;
      await AsyncStorage.setItem(storageKey, JSON.stringify(cacheItem));

      logger.debug('Cache set', { key, ttlMinutes });
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  /**
   * Remove specific cache item
   */
  async remove(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
      const storageKey = this.prefix + key;
      await AsyncStorage.removeItem(storageKey);
      logger.debug('Cache removed', { key });
    } catch (error) {
      logger.error('Cache remove error', { key, error });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      
      // Clear all cache items from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(cacheKeys);
      
      logger.info('Cache cleared', { removedKeys: cacheKeys.length });
    } catch (error) {
      logger.error('Cache clear error', { error });
    }
  }

  /**
   * Get cached data or fetch if not available
   */
  async getOrFetch<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlMinutes: number = 5
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedData = await this.get<T>(key);
      if (cachedData !== null) {
        return cachedData;
      }

      // Fetch fresh data
      logger.debug('Fetching fresh data', { key });
      const freshData = await fetchFunction();

      // Cache the fresh data
      await this.set(key, freshData, ttlMinutes);

      return freshData;
    } catch (error) {
      logger.error('Cache getOrFetch error', { key, error });
      throw error;
    }
  }

  /**
   * Check if cache item is still valid
   */
  private isValid<T>(cacheItem: CacheItem<T>): boolean {
    const now = Date.now();
    return (now - cacheItem.timestamp) < cacheItem.ttl;
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): { memoryItems: number; storageSize: string } {
    return {
      memoryItems: this.memoryCache.size,
      storageSize: 'Unknown', // AsyncStorage doesn't provide size info easily
    };
  }

  /**
   * Clean up expired items from memory cache
   */
  cleanupMemoryCache(): void {
    let cleaned = 0;
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Memory cache cleanup', { itemsRemoved: cleaned });
    }
  }

  /**
   * Cache keys for common data types
   */
  static keys = {
    events: (userId?: string) => `events_${userId || 'all'}`,
    userProfile: (userId: string) => `user_profile_${userId}`,
    eventDetails: (eventId: string) => `event_details_${eventId}`,
    monthlyBook: () => 'monthly_book_current',
    notifications: (userId: string) => `notifications_${userId}`,
    faqs: () => 'faqs_published',
  } as const;
}

// Export singleton instance
export const cacheService = new CacheService();

// Start periodic cleanup (every 5 minutes)
setInterval(() => {
  cacheService.cleanupMemoryCache();
}, 5 * 60 * 1000);

export default cacheService; 