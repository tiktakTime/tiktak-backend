import { getConnInfo } from "@hono/node-server/conninfo";
import type { MiddlewareHandler } from "hono";

import { app_config } from "@/app.config";
import { env } from "@/core/env";
import { AppError } from "@/core/errors";
import { getRedis } from "@/core/redis";

interface RateLimitConfig {
  window_ms: number;
  max_requests: number;
  key_generator?: (c: {
    get: (k: string) => unknown;
    req: {
      header: (name: string) => string | undefined;
      param: (name: string) => string | undefined;
    };
  }) => string;
  key_prefix?: string;
  message?: string;
  force?: boolean;
}

/** Rate-limit anahtarını güvenli karakterlerle kısalt. */
function sanitizeKey(value: string, maxLength = 200): string {
  return value.replace(/[^a-zA-Z0-9.\-_]/g, "").slice(0, maxLength);
}

/** IP adresini rate-limit anahtarı için temizle. */
function sanitizeIp(ip: string, maxLength = 100): string {
  return ip.replace(/[^a-zA-Z0-9.:\-_]/g, "").slice(0, maxLength);
}

/** Dev'de rate-limit kapalı — `TEST_RATE_LIMIT` veya `force` ile açılır. */
function isBypassedByEnv(config: RateLimitConfig): boolean {
  return (
    env.NODE_ENV === "development" &&
    !process.env.TEST_RATE_LIMIT &&
    !config.force
  );
}

/** Super-admin muafiyeti; context değişkeni yazılmamış olabilir. */
function isSuperAdmin(c: { get: (k: string) => unknown }): boolean {
  try {
    return Boolean(c.get("is_super_admin"));
  } catch {
    return false;
  }
}

type RateLimitContext = Parameters<MiddlewareHandler>[0];

/** İstemci IP'si: proxy header'ları → bağlantı bilgisi → `unknown`. */
function clientIp(c: RateLimitContext): string {
  const forwarded =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip");
  if (forwarded) return forwarded;

  try {
    return getConnInfo(c).remote.address || "unknown";
  } catch {
    return "unknown";
  }
}

function buildKey(config: RateLimitConfig, c: RateLimitContext): string {
  const prefix = config.key_prefix ?? "rate-limit:";
  return config.key_generator
    ? prefix + sanitizeKey(config.key_generator(c), 200)
    : prefix + sanitizeIp(clientIp(c), 100);
}

/** Atomik sayaç + kalan TTL (ms). İlk istekte pencere başlar. */
const RATE_LIMIT_SCRIPT = `
  local current = redis.call('incr', KEYS[1])
  if current == 1 then
    redis.call('pexpire', KEYS[1], ARGV[1])
  end
  local ttl = redis.call('pttl', KEYS[1])
  return {current, ttl}
`;

async function consumeQuota(
  key: string,
  windowMs: number,
): Promise<{ current: number; remainingMs: number }> {
  const [current, remainingMs] = (await getRedis().eval(
    RATE_LIMIT_SCRIPT,
    1,
    key,
    windowMs.toString(),
  )) as [number, number];
  return { current, remainingMs };
}

function applyQuotaHeaders(
  c: RateLimitContext,
  config: RateLimitConfig,
  current: number,
  remainingMs: number,
): void {
  const now = Date.now();
  const resetAt = remainingMs > 0 ? now + remainingMs : now + config.window_ms;

  c.header("X-RateLimit-Limit", config.max_requests.toString());
  c.header(
    "X-RateLimit-Remaining",
    Math.max(0, config.max_requests - current).toString(),
  );
  c.header("X-RateLimit-Reset", new Date(resetAt).toISOString());
}

/** Yapılandırmaya göre Redis tabanlı rate-limit middleware oluştur. */
export function createRateLimit(config: RateLimitConfig): MiddlewareHandler {
  return async (c, next) => {
    if (isBypassedByEnv(config) || isSuperAdmin(c)) {
      await next();
      return;
    }

    try {
      const { current, remainingMs } = await consumeQuota(
        buildKey(config, c),
        config.window_ms,
      );

      if (current > config.max_requests) {
        const retryAfter = Math.max(1, Math.ceil(remainingMs / 1000));
        c.header("Retry-After", retryAfter.toString());
        throw new AppError("TOO_MANY_REQUESTS", { retry_after: retryAfter });
      }

      applyQuotaHeaders(c, config, current, remainingMs);
    } catch (error) {
      // Redis erişilemezse istek geçer — rate-limit availability'yi düşürmesin.
      if (error instanceof AppError) throw error;
      console.error("Rate limit error (continuing without rate limit):", error);
    }

    await next();
  };
}

export const rate_limit = {
  standard: createRateLimit({
    window_ms: app_config.rate_limit.standard.window_ms,
    max_requests: app_config.rate_limit.standard.max_requests,
  }),
  /** Özel pencere ve limit ile rate-limit middleware üret. */
  custom: (window_ms: number, max_requests: number, message?: string) =>
    createRateLimit({ window_ms, max_requests, message }),
  auth: createRateLimit({
    window_ms: app_config.rate_limit.auth.window_ms,
    max_requests: app_config.rate_limit.auth.max_requests,
    key_prefix: "rate-limit:auth:",
    force: true,
  }),
  test: createRateLimit({
    window_ms: 10 * 1000,
    max_requests: 3,
    force: true,
  }),
};

/** Verilen IP için rate-limit sayacını temizle. */
export async function clearRateLimit(ip: string) {
  try {
    await getRedis().del(`rate-limit:${sanitizeIp(ip, 100)}`);
  } catch (error) {
    console.error("Rate limit clear error:", error);
  }
}
