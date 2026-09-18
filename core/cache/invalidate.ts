import type { Context } from "hono";

import { type InvalidateKeyType, invalidateKey } from "@/core/query-keys";

import { type RouteLike, substituteParams } from "./key";
import { defaultCacheStore } from "./store";

let currentInvalidateKeyType: InvalidateKeyType = "react-query";

/** Socket invalidate için aktif query-key stratejisini ayarla. */
export function setInvalidateKeyType(type: InvalidateKeyType) {
  currentInvalidateKeyType = type;
}

/** Aktif invalidate query-key stratejisini döndür. */
export function getInvalidateKeyType(): InvalidateKeyType {
  return currentInvalidateKeyType;
}

export interface CacheConfig {
  invalidate_key_type?: InvalidateKeyType;
}

/** Yanıt önbelleği çalışma ayarlarını uygula. */
export function configureCache(config: CacheConfig) {
  if (config.invalidate_key_type !== undefined) {
    currentInvalidateKeyType = config.invalidate_key_type;
  }
}

type SocketEmitter = (rooms: string[], queryKeys: unknown[][]) => void;

let globalSocketEmitter: SocketEmitter | null = null;

/** Cache invalidation olaylarını yayınlayan socket emitörünü kaydet. */
export function setSocketEmitter(emitter: SocketEmitter) {
  globalSocketEmitter = emitter;
}

/** Socket oda adlarını path prefix’ten türet (`{kind}:{id}||…`). */
function deriveRooms(pattern: string): string[] {
  const rooms: string[] = [];
  const parts = pattern.split("||");
  const prefixPart = parts[0];

  if (
    parts.length > 1 &&
    prefixPart &&
    prefixPart.includes(":") &&
    !prefixPart.includes("{") &&
    !prefixPart.includes("/")
  ) {
    rooms.push(prefixPart);
  }

  return rooms;
}

/** Path şablonundaki `{param}` adlarını gerçek değerlerle eşle. */
function routeParamsOf(
  path: string,
  allParams: Record<string, string>,
): Record<string, string> {
  const names = (path.match(/\{([^}]+)\}/g) ?? []).map((m) => m.slice(1, -1));
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = allParams[name];
    if (value !== undefined && value !== null) out[name] = String(value);
  }
  return out;
}

/** Şablonlu pattern → silinecek temel yol (`org:1||/person/{id}` → `org:1||/person`). */
function basePathOf(pattern: string): string | undefined {
  const clean = pattern.split("{")[0];
  if (!clean) return undefined;

  const base = clean.endsWith("/") ? clean.slice(0, -1) : clean;
  if (!base || base === "/" || base.trim() === "") return undefined;
  return base;
}

/** Bir pattern için Redis silme işleri. */
function purgeRedis(pattern: string): Promise<void> {
  if (pattern.includes("{")) {
    const base = basePathOf(pattern);
    if (!base) return Promise.resolve();

    return Promise.all([
      defaultCacheStore.delete(base),
      defaultCacheStore.invalidateByPrefix(base + "/"),
      defaultCacheStore.invalidateByPrefix(base + ":"),
    ]).then(() => undefined);
  }

  return Promise.all([
    defaultCacheStore.delete(pattern),
    defaultCacheStore.invalidateByPrefix(pattern + ":"),
  ]).then(() => undefined);
}

function validatedQuery(c: Context): Record<string, unknown> | undefined {
  return (
    c.req.valid as unknown as (
      key: string,
    ) => Record<string, unknown> | undefined
  )?.("query");
}

/** Eşleşen cache anahtarlarını sil ve/veya socket invalidate yayınla. */
export async function invalidateKeys(
  routes: RouteLike[],
  options: {
    c: Context;
    prefixOverride?: string;
    mergeParams?: Record<string, string>;
    /** false: yalnızca socket FE key (Redis tag purge ayrı yapıldıysa). default true */
    redis?: boolean;
  },
) {
  const keyType = getInvalidateKeyType();
  const { prefixOverride, mergeParams, c, redis: doRedis = true } = options;
  const allParams = { ...c.req.param(), ...mergeParams };
  const rooms = new Set<string>();
  const queryKeys: unknown[][] = [];
  let intentionalGlobal = false;

  const invalidationPromises = routes.map((rt) => {
    const routeParams = routeParamsOf(rt.path, allParams);
    const prefix = prefixOverride ?? rt.prefix?.(c);

    // Scoped route but tenant unresolved — skip (do not wipe global keys).
    if (rt.prefix && !prefix && !prefixOverride) return Promise.resolve();
    if (!rt.prefix && !prefixOverride) intentionalGlobal = true;

    const url = substituteParams(rt.path, routeParams);
    const pattern = prefix ? `${prefix}||${url}` : url;

    for (const room of deriveRooms(pattern)) {
      rooms.add(room);
    }

    const qk = invalidateKey(
      rt,
      { ...routeParams, query: validatedQuery(c) as never },
      keyType,
    );
    if (qk) queryKeys.push(qk);

    return doRedis ? purgeRedis(pattern) : Promise.resolve();
  });

  await Promise.all(invalidationPromises);

  if (globalSocketEmitter && queryKeys.length > 0) {
    const roomList = [...rooms];
    if (roomList.length > 0 || intentionalGlobal) {
      globalSocketEmitter(roomList, queryKeys);
    }
  }
}
