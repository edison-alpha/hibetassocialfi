// Message caching hook for better performance
import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseCacheOptions {
  ttl?: number; // Time to live in milliseconds
}

export const useMessageCache = <T = any>(options: UseCacheOptions = {}) => {
  const { ttl = 5000 } = options; // Default 5 seconds
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [, forceUpdate] = useState({});

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) return null;
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, [ttl]);

  const set = useCallback((key: string, data: T) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
    forceUpdate({});
  }, []);

  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key);
    forceUpdate({});
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    forceUpdate({});
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      cacheRef.current.delete(key);
      return false;
    }
    
    return true;
  }, [ttl]);

  return { get, set, remove, clear, has };
};

// Singleton cache for messages across components
class MessageCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl = 10000; // 10 seconds

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const messageCacheManager = new MessageCacheManager();

// Auto cleanup every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    messageCacheManager.cleanup();
  }, 60000);
}
