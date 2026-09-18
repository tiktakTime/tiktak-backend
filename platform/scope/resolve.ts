import type { Context } from "hono";

import { SCOPE_ORG_KEYS } from "./constants";

/** Untyped Hono context — cycle yok. */
type AppContext = Context;

function ctxGet(c: AppContext, key: string): unknown {
  return (c.get as (k: string) => unknown)(key);
}

function ctxSet(c: AppContext, key: string, value: unknown): void {
  (c.set as (k: string, v: unknown) => void)(key, value);
}

/** Kayıttan ilk dolu string anahtarı seç. */
function pickString(
  source: Record<string, unknown> | undefined,
  keys: readonly string[],
): string | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function fromContext(c: AppContext, keys: readonly string[]) {
  const source: Record<string, unknown> = {};
  for (const key of keys) source[key] = ctxGet(c, key);
  return pickString(source, keys);
}

function fromParams(c: AppContext, keys: readonly string[]) {
  try {
    return pickString(c.req.param(), keys);
  } catch {
    // param henüz yok (route match öncesi)
    return undefined;
  }
}

function fromQuery(c: AppContext, keys: readonly string[]) {
  for (const key of keys) {
    const value = c.req.query(key);
    if (value) return value;
  }
  return undefined;
}

function fromBody(c: AppContext, keys: readonly string[]) {
  try {
    const body = (
      c.req.valid as unknown as (
        key: string,
      ) => Record<string, unknown> | undefined
    )?.("json");
    return pickString(body, keys);
  } catch {
    // body validate edilmemiş
    return undefined;
  }
}

/**
 * İstekten scope id çöz.
 * Öncelik: context → path param → query → validated JSON body.
 */
export function resolveScopeId(
  c: AppContext,
  keys: readonly string[],
): string | undefined {
  return (
    fromContext(c, keys) ??
    fromParams(c, keys) ??
    fromQuery(c, keys) ??
    fromBody(c, keys)
  );
}

export function resolveOrganizationId(c: AppContext): string | undefined {
  return resolveScopeId(c, SCOPE_ORG_KEYS);
}

/**
 * Context’e eksik tenant bilgisini query/body’den yaz (cache key / socket room).
 * Authorization yerine geçmez.
 */
export function hydrateScope(c: AppContext): void {
  if (typeof ctxGet(c, "organization_id") !== "string") {
    const orgId = resolveOrganizationId(c);
    if (orgId) ctxSet(c, "organization_id", orgId);
  }
}
