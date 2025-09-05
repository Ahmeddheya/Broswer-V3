import { MMKV } from 'react-native-mmkv';

class CacheManager {
  private storage: MMKV;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 50 * 1024 * 1024, defaultTTL: number = 24 * 60 * 60 * 1000) {
    this.storage = new MMKV({ id: 'cache' });
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    try {
      const expiresAt = Date.now() + (ttl || this.defaultTTL);
      const cacheItem = {
        value,
        expiresAt,
        createdAt: Date.now(),
      };

      this.storage.set(key, JSON.stringify(cacheItem));
      this.cleanup();
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const cached = this.storage.getString(key);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > cacheItem.expiresAt) {
        this.storage.delete(key);
        return null;
      }

      return cacheItem.value;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      this.storage.delete(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  clear(): void {
    try {
      this.storage.clearAll();
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  private cleanup(): void {
    try {
      // Get all keys and their sizes
      const keys = this.storage.getAllKeys();
      let totalSize = 0;
      const items: Array<{ key: string; size: number; createdAt: number }> = [];

      keys.forEach(key => {
        const value = this.storage.getString(key);
        if (value) {
          const size = new Blob([value]).size;
          totalSize += size;

          try {
            const parsed = JSON.parse(value);
            items.push({
              key,
              size,
              createdAt: parsed.createdAt || 0,
            });
          } catch {
            // Invalid cache item, mark for deletion
            items.push({
              key,
              size,
              createdAt: 0,
            });
          }
        }
      });

      // If over max size, remove oldest items
      if (totalSize > this.maxSize) {
        items.sort((a, b) => a.createdAt - b.createdAt);
        
        let removedSize = 0;
        const targetSize = this.maxSize * 0.8; // Remove to 80% of max size
        
        for (const item of items) {
          if (totalSize - removedSize <= targetSize) break;
          
          this.storage.delete(item.key);
          removedSize += item.size;
        }
      }
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }

  getStats() {
    try {
      const keys = this.storage.getAllKeys();
      let totalSize = 0;
      let validItems = 0;
      let expiredItems = 0;

      keys.forEach(key => {
        const value = this.storage.getString(key);
        if (value) {
          totalSize += new Blob([value]).size;
          
          try {
            const parsed = JSON.parse(value);
            if (Date.now() > parsed.expiresAt) {
              expiredItems++;
            } else {
              validItems++;
            }
          } catch {
            expiredItems++;
          }
        }
      });

      return {
        totalSize,
        validItems,
        expiredItems,
        totalItems: keys.length,
        maxSize: this.maxSize,
        usagePercentage: (totalSize / this.maxSize) * 100,
      };
    } catch (error) {
      console.warn('Cache stats error:', error);
      return null;
    }
  }
}

export const cacheManager = new CacheManager();