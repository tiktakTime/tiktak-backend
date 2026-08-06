import Redis from "ioredis";

import { env } from "@tiktak/env";

export const TTL = {
  MISS: 1000 * 30,
  DEFAULT: 1000 * 60 * 5,
  LONG: 1000 * 60 * 10,
} as const;

export const ENABLE_CACHE = true;

export interface CacheEntry {
  data: unknown;
  expiry: number;
  createdAt: number;
}

export interface CacheStore {
  get(key: string): Promise<{ data: unknown } | undefined>;
  set(key: string, value: { data: unknown }, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByPrefix(prefix: string): Promise<void>;
  keys(): Promise<{ key: string; createdAt: number }[]>;
}

export class RedisCacheStore implements CacheStore {
  readonly redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  private key(k: string) {
    return `cache:${k}`;
  }

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

  async set(key: string, value: { data: unknown }, ttl: number): Promise<void> {
    if (!ENABLE_CACHE) return;
    const entry: CacheEntry = {
      data: value.data,
      expiry: Date.now() + ttl,
      createdAt: Date.now(),
    };
    await this.redis.set(this.key(key), JSON.stringify(entry), "PX", ttl);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(this.key(key));
  }

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
          key: k.slice(6), // remove "cache:"
          createdAt: entry.createdAt,
        });
      } catch {}
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const defaultCacheStore = new RedisCacheStore(new Redis(env.REDIS_URL));
