/**
 * `RouteDef` → zod-openapi `RouteConfig` derlemesi.
 * Scope middleware + policy kontrolü burada zincire eklenir.
 */
import { type RouteConfig, createRoute } from "@hono/zod-openapi";
import type { MiddlewareHandler } from "hono";

import { app_config } from "@/app.config";
import {
  BASE_ERROR_TITLES,
  ERROR_CODES,
  type ErrorCode,
} from "@/core/errors/errors";
import { routeToUnityOperationId } from "@/core/query-keys";

import type { RouteDef } from "./define";
import { registerRequiredTenant, requirePlatform, scopeFor } from "./platform";
import { Failure } from "./response-spec";

type CacheScopes = typeof app_config.cache.scopes;

function scopeCacheConfig(tenant: string) {
  return app_config.cache.scopes[tenant as keyof CacheScopes];
}

export function cacheAllowedForTenant(tenant: string): boolean {
  const cfg = scopeCacheConfig(tenant);
  if (!cfg) return tenant !== "none";
  if ("allowed" in cfg && cfg.allowed === false) return false;
  return true;
}

export function cacheRequiredForTenant(tenant: string): boolean {
  const cfg = scopeCacheConfig(tenant);
  if (!cfg) return true;
  if ("required" in cfg) return cfg.required === true;
  return true;
}

/** Scope middleware + (varsa) policy kontrolü. */
function buildMiddlewares(def: RouteDef, tenant: string): MiddlewareHandler[] {
  const middlewares: MiddlewareHandler[] = [
    (c, next) => scopeFor(tenant).middleware(c, next),
  ];

  if (def.policy?.length) {
    const policy = def.policy;
    middlewares.push(async (c, next) => {
      requirePlatform().checkPolicy?.(c, policy);
      await next();
    });
  }

  return middlewares;
}

/** `request` bloğunu OpenAPI şekline çevir (body → JSON content). */
function buildRequest(def: RouteDef): RouteConfig["request"] {
  const reqIn = def.request;
  if (!reqIn) return undefined;

  const built = {
    ...(reqIn.params ? { params: reqIn.params } : {}),
    ...(reqIn.query ? { query: reqIn.query } : {}),
    ...(reqIn.headers ? { headers: reqIn.headers } : {}),
    ...(reqIn.cookies ? { cookies: reqIn.cookies } : {}),
    ...(reqIn.body
      ? {
          body: {
            content: { "application/json": { schema: reqIn.body } },
            required: true as const,
          },
        }
      : {}),
  };

  return built as RouteConfig["request"];
}

/** 200 + standart hata yanıtları (status `ERROR_CODES`, İngilizce başlık). */
function buildResponses(def: RouteDef): RouteConfig["responses"] {
  const responses: Record<number, unknown> = {
    200: def.response.openapi,
  };

  for (const code of Object.keys(ERROR_CODES) as ErrorCode[]) {
    responses[ERROR_CODES[code]] = Failure(BASE_ERROR_TITLES[code]);
  }

  return responses as RouteConfig["responses"];
}

export function compileRouteDef(def: RouteDef): RouteConfig {
  const tenant = def.tenant ?? "none";
  registerRequiredTenant(tenant);

  const middlewares = buildMiddlewares(def, tenant);
  const security =
    (def.security ?? "bearer") === "bearer" ? [{ bearer: [] }] : [];

  return createRoute({
    method: def.method,
    path: def.path,
    operationId: routeToUnityOperationId(def.method, def.path),
    summary: def.summary,
    tags: def.tag ? [def.tag] : [],
    security,
    request: buildRequest(def),
    responses: buildResponses(def),
    middleware: middlewares as [MiddlewareHandler, ...MiddlewareHandler[]],
  });
}
