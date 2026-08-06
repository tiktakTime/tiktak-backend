import {
  type InvalidateKeyType,
  configureCache,
  defaultCacheStore,
} from "@tiktak/cache";
import { createApp } from "@tiktak/core";
import { rateLimit } from "@tiktak/middlewares";

import configureOpenAPI from "@/app/configure-open-api";

/**
 * Starter domain routers (organization/user) are unmounted until humans
 * modules are reimplemented against org_* tables.
 */
export function createConfiguredApp(options?: {
  invalidateKeyType?: InvalidateKeyType;
}) {
  configureCache({
    invalidateKeyType: options?.invalidateKeyType ?? "react-query",
  });

  const app = createApp();

  app.get("/healthz", (c) => {
    c.status(200);
    return c.text("healthy");
  });

  app.get("/cache-keys", async (c) => {
    const cacheKeys = await defaultCacheStore.keys();
    const rateLimitKeys = await defaultCacheStore.redis.keys("rate-limit:*");

    const rateLimitDetails = [];
    for (const key of rateLimitKeys) {
      const value = await defaultCacheStore.redis.get(key);
      const ttl = await defaultCacheStore.redis.ttl(key);
      rateLimitDetails.push({
        key: key.replace(/^rate-limit:/, ""),
        requests: value ? parseInt(value, 10) : 0,
        ttl: ttl,
      });
    }

    return c.json({
      cache: cacheKeys,
      rateLimit: rateLimitDetails,
      count: cacheKeys.length + rateLimitKeys.length,
    });
  });

  configureOpenAPI(app);

  app.use(rateLimit.standard);

  app.get("/ping", (c) => {
    return c.text("pong");
  });

  return app;
}
