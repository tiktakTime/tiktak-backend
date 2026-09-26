/**
 * Handler sarma + slice kaydı: cache okuma/yazma, purge, zarf render.
 *
 * `any` bu dosyada bilinçli: Hono'nun doğrulanmış girdi tipleri (`req.valid`)
 * generic `out` alanları üzerinden çözülüyor; daraltmak her slice şemasında
 * atama hatası üretir.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- Hono validated-input generic'leri */
import type { RouteConfig } from "@hono/zod-openapi";
import type { Context, Next } from "hono";

import {
  type RouteLike,
  buildCacheKeyFromRoute,
  defaultCacheStore,
  invalidateKeys,
} from "@/core/cache";
import { type AppBindings, type AppOpenAPI, createRouter } from "@/core/router";

import {
  cacheAllowedForTenant,
  cacheRequiredForTenant,
  compileRouteDef,
} from "./compile";
import type { RouteCtx, RouteDef } from "./define";
import { registerMutationSuccessKey } from "./i18n";
import { actorId, requirePlatform, scopeFor, tenantId } from "./platform";
import { applyResponseHeaders, renderSuccess } from "./render";
import { isNamedSuccess } from "./result";
import { qualifyTags, registerTags, routesForPurgeTags } from "./tags";

type RouteHandlerInput = {
  in: {
    json: Record<string, unknown>;
    query: Record<string, unknown>;
    param: Record<string, unknown>;
    header: Record<string, unknown>;
    cookie: Record<string, unknown>;
  };
  out: {
    json: any;
    query: any;
    param: any;
    header: any;
    cookie: any;
  };
};

type RouteHandlerContext = Context<AppBindings, string, RouteHandlerInput>;

type RouteHandlerFn = (
  c: RouteHandlerContext,
  next: Next,
) => Response | Promise<Response | void> | void;

function buildCtx(c: Context<AppBindings>, def: RouteDef): RouteCtx {
  const req = def.request;
  const rc = c as RouteHandlerContext;
  return {
    get params() {
      return (req?.params ? rc.req.valid("param") : {}) as RouteCtx["params"];
    },
    get query() {
      return (req?.query ? rc.req.valid("query") : {}) as RouteCtx["query"];
    },
    get body() {
      return (req?.body ? rc.req.valid("json") : {}) as RouteCtx["body"];
    },
    get tenantId() {
      return tenantId(c);
    },
    get actorId() {
      return actorId(c);
    },
    c,
  };
}

function toResponse(
  c: Context<AppBindings>,
  def: RouteDef,
  result: unknown,
): Response {
  if (result instanceof Response) return result;

  if (def.response.mode === "page") {
    applyResponseHeaders(c);
    return c.json(result as never, 200);
  }

  if (isNamedSuccess(result)) {
    return c.json(
      renderSuccess(c, {
        code: result.code,
        data: result.data,
        params: result.params,
      }) as never,
      200,
    );
  }

  return c.json(
    renderSuccess(c, { code: def.name, data: result }) as never,
    200,
  );
}

function dataHandler(def: RouteDef): RouteHandlerFn {
  return async (c) => {
    const result = await def.handle(buildCtx(c, def));
    return toResponse(c, def, result);
  };
}

/** Cache planı — hangi route'un neyi okuyup neyi purge ettiği. */
type CachePlan = {
  tenant: string;
  ttl: number | undefined;
  tags: string[] | undefined;
  purge: string[] | undefined;
  required: boolean;
  routeLike: RouteLike;
};

function buildCachePlan(def: RouteDef, compiled: RouteConfig): CachePlan {
  const tenant = def.tenant ?? "none";
  const read = def.cache?.read;

  return {
    tenant,
    ttl: cacheAllowedForTenant(tenant) ? read?.ttl : undefined,
    tags: read?.tags,
    purge: def.cache?.write?.purge,
    required: cacheRequiredForTenant(tenant),
    routeLike: {
      path: compiled.path,
      method: compiled.method,
      prefix: (c) => scopeFor(tenant).cacheKey(c as Context<AppBindings>),
    },
  };
}

/** Cache HIT varsa yanıtı döndür; yoksa `undefined`. */
async function readCached(
  plan: CachePlan,
  c: RouteHandlerContext,
  def: RouteDef,
): Promise<Response | undefined> {
  const key = buildCacheKeyFromRoute(plan.routeLike, c);

  if (!key) {
    if (plan.required) {
      throw new Error(
        `Cache required for tenant "${plan.tenant}" but cache key could not be resolved (route ${def.method.toUpperCase()} ${def.path})`,
      );
    }
    return undefined;
  }

  const cached = await defaultCacheStore.get(key);
  return cached ? c.json(cached.data as never) : undefined;
}

async function writeCached(
  plan: CachePlan,
  c: RouteHandlerContext,
  response: Response,
  scopePrefix: string | undefined,
): Promise<void> {
  if (!plan.ttl) return;

  const key = buildCacheKeyFromRoute(plan.routeLike, c);
  if (!key) return;

  const body = await response.clone().json();
  const qualified = qualifyTags(plan.tags ?? [], scopePrefix);

  if (qualified.length > 0) {
    await defaultCacheStore.setWithTags(
      key,
      { data: body },
      plan.ttl,
      qualified,
    );
    return;
  }

  await defaultCacheStore.set(key, { data: body }, plan.ttl);
}

/** Tag purge + socket invalidate — yanıtı bekletmemek için fire-and-forget. */
function schedulePurge(
  plan: CachePlan,
  c: RouteHandlerContext,
  scopePrefix: string | undefined,
): void {
  const purge = plan.purge;
  if (!purge?.length) return;

  const qualified = qualifyTags(purge, scopePrefix);

  void (async () => {
    try {
      if (qualified.length > 0) {
        await defaultCacheStore.purgeTags(qualified);
      }
      const related = routesForPurgeTags(purge);
      if (related.length > 0) {
        await invalidateKeys(related, { c, redis: false });
      }
    } catch (err) {
      console.error("Background tag purge / socket invalidate failed:", err);
    }
  })();
}

function wrapHandler(
  def: RouteDef,
  compiled: RouteConfig,
  handle: RouteHandlerFn,
): RouteHandlerFn {
  const plan = buildCachePlan(def, compiled);

  if (plan.ttl && plan.tags?.length) {
    registerTags(plan.tags, plan.routeLike);
  }

  // Cache ilgisi yoksa sarma maliyeti de olmasın.
  if (!plan.ttl && !plan.purge?.length) {
    return handle;
  }

  return (async (c: RouteHandlerContext, next: Next) => {
    requirePlatform().hydrateScope?.(c);

    if (plan.ttl) {
      const hit = await readCached(plan, c, def);
      if (hit) return hit;
    }

    const response = await handle(c, next);
    if (!(response instanceof Response) || response.status >= 300) {
      return response;
    }

    requirePlatform().hydrateScope?.(c);
    const scopePrefix = scopeFor(plan.tenant).cacheKey(c);

    await writeCached(plan, c, response, scopePrefix);
    schedulePurge(plan, c, scopePrefix);

    return response;
  }) as RouteHandlerFn;
}

/** Global `name` benzersizliği — slice'lar arası çakışmayı yakalar. */
const registeredRouteNames = new Set<string>();
const registeredRoutes: RouteDef[] = [];

/** Yüklenmiş route tanımları. Bütünlük testleri buradan okur. */
export function listRegisteredRoutes(): readonly RouteDef[] {
  return registeredRoutes;
}

/** `createRouter` + derleme + cache wrap. `name` global benzersiz olmalı. */
export function createSlice(defs: readonly RouteDef[]): AppOpenAPI {
  for (const def of defs) {
    if (registeredRouteNames.has(def.name)) {
      throw new Error(`Duplicate route name "${def.name}" in createSlice`);
    }
    registeredRouteNames.add(def.name);
    registeredRoutes.push(def);
    if (def.method !== "get") {
      registerMutationSuccessKey(def.name);
    }
  }

  const app = createRouter();
  const compiled = defs.map((def) => {
    const route = compileRouteDef(def);
    return {
      route,
      handler: wrapHandler(def, route, dataHandler(def)),
    };
  });

  return app.openapiRoutes(compiled as never) as AppOpenAPI;
}
