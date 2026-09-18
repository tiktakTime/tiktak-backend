import { app_config } from "@/app.config";
import { getRedis } from "@/core/redis";

export const TTL = {
  MISS: app_config.cache.ttl.miss_ms,
  DEFAULT: app_config.cache.ttl.default_ms,
  LONG: app_config.cache.ttl.long_ms,
} as const;

export const ENABLE_CACHE = app_config.cache.enabled;

export interface CacheEntry {
  data: unknown;
  expiry: number;
  createdAt: number;
}

export interface CacheStore {
  get(key: string): Promise<{ data: unknown } | undefined>;
  set(key: string, value: { data: unknown }, ttl: number): Promise<void>;
  setWithTags?(
    key: string,
    value: { data: unknown },
    ttl: number,
    tags: string[],
  ): Promise<void>;
  purgeTags?(tags: string[]): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByPrefix(prefix: string): Promise<void>;
  keys(): Promise<{ key: string; createdAt: number }[]>;
}

/** Yanıt önbelleğini Redis üzerinde tutan depo. */
export class RedisCacheStore implements CacheStore {
  /** Paylaşılan Redis istemcisini döndür. */
  get redis() {
    return getRedis();
  }

  /** Mantıksal anahtarı Redis cache prefix’iyle birleştir. */
  private key(k: string) {
    return `cache:${k}`;
  }

  /** Önbellekten değeri oku. */
  async get(key: string): Promise<{ data: unknown } | undefined> {
    if (!ENABLE_CACHE) return undefined;
    const raw = await this.redis.get(this.key(key));
    if (!raw) return undefined;
    try {
      const entry = JSON.parse(raw) as CacheEntry;
      return { data: entry.data };
    } catch {
      return undefined;
    }
  }

  /** Değeri TTL ile önbelleğe yaz. */
  async set(key: string, value: { data: unknown }, ttl: number): Promise<void> {
    if (!ENABLE_CACHE) return;
    const entry: CacheEntry = {
      data: value.data,
      expiry: Date.now() + ttl,
      createdAt: Date.now(),
    };
    await this.redis.set(this.key(key), JSON.stringify(entry), "PX", ttl);
  }

  private tagKey(tag: string) {
    return `cache:tag:${tag}`;
  }

  /** Değeri yaz ve surrogate tag set’lerine ekle. */
  async setWithTags(
    key: string,
    value: { data: unknown },
    ttl: number,
    tags: string[],
  ): Promise<void> {
    await this.set(key, value, ttl);
    if (!ENABLE_CACHE || tags.length === 0) return;
    const cacheKey = this.key(key);
    const pipeline = this.redis.pipeline();
    for (const tag of tags) {
      const tk = this.tagKey(tag);
      pipeline.sadd(tk, cacheKey);
      pipeline.pexpire(tk, ttl);
    }
    await pipeline.exec();
  }

  /** Tag’lere bağlı tüm cache anahtarlarını sil. */
  async purgeTags(tags: string[]): Promise<void> {
    if (!ENABLE_CACHE || tags.length === 0) return;
    for (const tag of tags) {
      const tk = this.tagKey(tag);
      const members = await this.redis.smembers(tk);
      if (members.length > 0) {
        await this.redis.del(...members);
      }
      await this.redis.del(tk);
    }
  }

  /** Tek bir önbellek anahtarını sil. */
  async delete(key: string): Promise<void> {
    await this.redis.del(this.key(key));
  }

  /** Verilen önekle eşleşen tüm cache anahtarlarını sil. */
  async invalidateByPrefix(prefix: string): Promise<void> {
    const pattern = this.key(prefix) + "*";
    let cursor = "0";
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== "0");
  }

  /** Cache anahtarlarını oluşturulma zamanına göre listele. */
  async keys(): Promise<{ key: string; createdAt: number }[]> {
    const pattern = this.key("") + "*";
    const allKeys: string[] = [];
    let cursor = "0";
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        200,
      );
      cursor = nextCursor;
      allKeys.push(...keys);
    } while (cursor !== "0");

    const result: { key: string; createdAt: number }[] = [];

    for (const k of allKeys) {
      const raw = await this.redis.get(k);
      if (!raw) continue;
      try {
        const entry = JSON.parse(raw) as CacheEntry;
        result.push({
          key: k.slice(6),
          createdAt: entry.createdAt,
        });
      } catch {
        // skip corrupt entries
      }
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const defaultCacheStore = new RedisCacheStore();
