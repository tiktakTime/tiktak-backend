import { getConnInfo } from "@hono/node-server/conninfo";
import type { MiddlewareHandler } from "hono";
import Redis from "ioredis";

import { AppError } from "@tiktak/core";
import { env } from "@tiktak/env";

const redis = new Redis(env.REDIS_URL);

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (c: {
    get: (k: string) => unknown;
    req: { param: (name: string) => string | undefined };
  }) => string;
  keyPrefix?: string; // Prefix for cache key when using keyGenerator
  message?: string;
  force?: boolean; // Force rate limiting even in development
}

function sanitizeKey(value: string, maxLength = 200): string {
  return value.replace(/[^a-zA-Z0-9.\-_]/g, "").slice(0, maxLength);
}

function sanitizeIp(ip: string, maxLength = 100): string {
  return ip.replace(/[^a-zA-Z0-9.:\-_]/g, "").slice(0, maxLength);
}

export function createRateLimit(config: RateLimitConfig): MiddlewareHandler {
  return async (c, next) => {
    // Skip rate limiting in development for better performance unless test flag is active or force is true
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.TEST_RATE_LIMIT &&
      !config.force
    ) {
      await next();
      return;
    }

    try {
      if (c.get("isSuperAdmin")) {
        await next();
        return;
      }
    } catch {
      // context is not set yet, proceed with rate limiting
    }

    let rawKey = "";
    if (config.keyGenerator) {
      rawKey = config.keyGenerator(c);
    } else {
      const forwarded =
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
        c.req.header("x-real-ip");
      if (forwarded) {
        rawKey = forwarded;
      } else {
        try {
          const conn = getConnInfo(c);
          rawKey = conn.remote.address || "unknown";
        } catch {
          rawKey = "unknown";
        }
      }
    }

    const prefix = config.keyPrefix ?? "rate-limit:";
    const key =
      prefix +
      (config.keyGenerator
        ? sanitizeKey(rawKey, 200)
        : sanitizeIp(rawKey, 100));

    try {
      const rateLimitScript = `
        local current = redis.call('incr', KEYS[1])
        if current == 1 then
          redis.call('pexpire', KEYS[1], ARGV[1])
        end
        local ttl = redis.call('pttl', KEYS[1])
        return {current, ttl}
      `;

      const [current, remainingMs] = (await redis.eval(
        rateLimitScript,
        1,
        key,
        config.windowMs.toString(),
      )) as [number, number];

      const now = Date.now();
      const resetAt =
        remainingMs > 0 ? now + remainingMs : now + config.windowMs;

      if (current > config.maxRequests) {
        const retryAfter = Math.max(1, Math.ceil(remainingMs / 1000));

        c.header("Retry-After", retryAfter.toString());

        throw new AppError(
          "TOO_MANY_REQUESTS",
          config.message?.replace("{retryAfter}", retryAfter.toString()) ||
            "error.too_many_requests",
        );
      }

      c.header("X-RateLimit-Limit", config.maxRequests.toString());
      c.header(
        "X-RateLimit-Remaining",
        Math.max(0, config.maxRequests - current).toString(),
      );
      c.header("X-RateLimit-Reset", new Date(resetAt).toISOString());
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Rate limit error (continuing without rate limit):", error);
    }

    await next();
  };
}

export const rateLimit = {
  standard: createRateLimit({
    windowMs: 60 * 1000,
    maxRequests: 2000,
    message: "error.too_many_requests",
  }),

  custom: (windowMs: number, maxRequests: number, message?: string) =>
    createRateLimit({ windowMs, maxRequests, message }),

  test: createRateLimit({
    windowMs: 10 * 1000,
    maxRequests: 3,
    message: "error.too_many_requests",
    force: true,
  }),
};

export async function clearRateLimit(ip: string) {
  const key = `rate-limit:${sanitizeIp(ip, 100)}`;
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Rate limit clear error:", error);
  }
}
