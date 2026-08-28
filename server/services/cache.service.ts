interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCacheService {
  private static store = new Map<string, CacheItem<any>>();
  private static hits = 0;
  private static misses = 0;

  static set<T>(key: string, value: T, ttlMs: number = 30000): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  static get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) {
      this.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.value as T;
  }

  static del(key: string): boolean {
    return this.store.delete(key);
  }

  static flush(): void {
    this.store.clear();
  }

  static purgeExpired(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }
    return purged;
  }

  static getMetrics() {
    return {
      entries: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : "0",
    };
  }
}

// Automatically prune expired keys every 2 minutes
setInterval(() => {
  MemoryCacheService.purgeExpired();
}, 2 * 60 * 1000);
