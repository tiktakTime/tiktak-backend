import { app_config } from "@/app.config";
import { adminRouter } from "@/apps/admin";
import { authRouter } from "@/apps/auth";
import { commonRouter } from "@/apps/common";
import { mobileRouter } from "@/apps/mobile";
import { publicRouter } from "@/apps/public";
import { healthRouter } from "@/apps/system/health";
import { webRouter } from "@/apps/web";
import { configureCache } from "@/core/cache";
import { env } from "@/core/env";
import { configureI18n, configureRoutePlatform } from "@/core/http";
import { type AppOpenAPI, createApp, createRouter } from "@/core/router";
import {
  assertMember,
  assertOrganization,
  assertPermission,
  rate_limit,
  requireMember,
  requireOrganization,
} from "@/middlewares";
import { ERROR_META, bundles } from "@/platform/i18n";
import { hydrateScope } from "@/platform/scope";

import { mountOpenAPI } from "./openapi";

const surfaceRouters = {
  public: publicRouter,
  common: commonRouter,
  web: webRouter,
  mobile: mobileRouter,
  admin: adminRouter,
} as const;

/**
 * Composition root: uygulamayı kurar, dinlemez — `index.ts` ve testler buradan çağırır.
 */
export function buildServer() {
  configureI18n({
    bundles,
    defaultLocale: "en",
    errorMeta: ERROR_META,
  });
  configureRoutePlatform({
    hydrateScope,
    scopes: {
      org: {
        middleware: async (c, next) => {
          const id = assertOrganization(c);
          c.set("org_id", id);
          await next();
        },
        cacheKey: (c) => {
          const id = c.get("org_id") ?? c.get("organization_id");
          return id ? `org:${id}` : undefined;
        },
      },
      member: {
        middleware: requireMember,
        cacheKey: (c) => {
          const id = c.get("user_id");
          return id ? `user:${id}` : undefined;
        },
      },
      orgParam: {
        middleware: requireOrganization,
        cacheKey: (c) => {
          try {
            const fromParam = c.req.param("id");
            if (fromParam) return `org:${fromParam}`;
          } catch {
            // param henüz yok
          }
          const id = c.get("organization_id");
          return id ? `org:${id}` : undefined;
        },
      },
      none: {
        middleware: async (_c, next) => next(),
        cacheKey: () => undefined,
      },
    },
    checkPolicy: (c, policy) => {
      for (const slug of policy) assertPermission(c, slug);
    },
    resolveTenantId: (c) => {
      const id = c.get("org_id") ?? c.get("organization_id");
      if (id) return id;
      return assertOrganization(c);
    },
    resolveActorId: assertMember,
  });
  configureCache({
    invalidate_key_type: app_config.cache.invalidate_key_type,
  });

  const api = createRouter();
  api.use("*", rate_limit.standard);

  // Cast: deep OpenAPI route unions exceed TS instantiation limits.
  const mount = (router: AppOpenAPI, path = "/") => api.route(path, router);

  // Sistem + melez auth — surfaces döngüsü dışında.
  mount(healthRouter);
  mount(authRouter);

  for (const [name, surface] of Object.entries(app_config.surfaces) as Array<
    [keyof typeof surfaceRouters, (typeof app_config.surfaces)["common"]]
  >) {
    if (surface.enabled) {
      mount(surfaceRouters[name], surface.prefix || "/");
    }
  }

  mountOpenAPI(api);

  return createApp().route(env.API_BASE_PATH, api);
}
