import type { Context } from "hono";

import type { AppBindings } from "@tiktak/core";

import { defaultCacheStore } from "./cache-provider";
import { InvalidateKeyType, invalidateKey } from "./query-keys";

let currentInvalidateKeyType: InvalidateKeyType = "react-query";

export function setInvalidateKeyType(type: InvalidateKeyType) {
  currentInvalidateKeyType = type;
}

export function getInvalidateKeyType(): InvalidateKeyType {
  return currentInvalidateKeyType;
}

export interface CacheConfig {
  invalidateKeyType?: InvalidateKeyType;
}

export function configureCache(config: CacheConfig) {
  if (config.invalidateKeyType !== undefined) {
    currentInvalidateKeyType = config.invalidateKeyType;
  }
}

export type RouteLike = {
  path: string;
  method: string;
  prefix?: (c: Context<AppBindings>) => string;
};

type SocketEmitter = (rooms: string[], queryKeys: unknown[][]) => void;

let globalSocketEmitter: SocketEmitter | null = null;

export function setSocketEmitter(emitter: SocketEmitter) {
  globalSocketEmitter = emitter;
}

function substituteParams(
  path: string,
  params: Record<string, string>,
): string {
  let url = path;
  for (const [k, v] of Object.entries(params)) {
    const sanitized = v.replace(/[{}()]/g, "_");
    url = url.replace(`{${k}}`, sanitized);
  }
  return url;
}

function deriveRooms(
  pattern: string,
  params: Record<string, string>,
): string[] {
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

  if (rooms.length === 0) {
    const priority = ["orgId", "userId"];
    for (const key of priority) {
      const val = params[key];
      if (val && !val.includes("{")) {
        const type = key.slice(0, -2);
        rooms.push(`${type}:${val}`);
        break;
      }
    }
  }

  return rooms;
}

export function buildCacheKeyFromRoute(
  route: RouteLike,
  c: Context<AppBindings>,
): string {
  const params = { ...c.req.param() };
  const queries: Record<string, string[]> = c.req.queries?.() ?? {};

  const queryEntries = Object.entries(queries)
    .filter(([, v]) => v.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const queryHash =
    queryEntries.length > 0
      ? `:${JSON.stringify(Object.fromEntries(queryEntries.map(([k, v]) => [k, v[0]])))}`
      : "";

  let url = substituteParams(route.path, params);
  const prefix = route.prefix?.(c);
  return (prefix ? `${prefix}||` : "") + url + queryHash;
}

export async function invalidateKeys(
  routes: RouteLike[],
  options: {
    c: Context<AppBindings>;
    prefixOverride?: string;
    mergeParams?: Record<string, string>;
  },
) {
  const keyType = getInvalidateKeyType();
  const { prefixOverride, mergeParams, c } = options;
  const allParams = { ...c.req.param(), ...mergeParams };
  const rooms = new Set<string>();
  const queryKeys: unknown[][] = [];

  const invalidationPromises = routes.map((rt) => {
    const paramNames = (rt.path.match(/\{([^}]+)\}/g) ?? []).map((m) =>
      m.slice(1, -1),
    );

    const routeParams: Record<string, string> = {};
    for (const name of paramNames) {
      const val = allParams[name];
      if (val !== undefined && val !== null) {
        routeParams[name] = String(val);
      }
    }

    const url = substituteParams(rt.path, routeParams);
    const prefix = prefixOverride ?? rt.prefix?.(c);
    const pattern = prefix ? `${prefix}||${url}` : url;

    for (const room of deriveRooms(pattern, allParams)) {
      rooms.add(room);
    }

    const query = (
      c.req.valid as unknown as (
        key: string,
      ) => Record<string, unknown> | undefined
    )?.("query");

    const qk = invalidateKey(
      rt as any,
      {
        ...routeParams,
        query: query as any,
      },
      keyType,
    );

    if (qk) {
      queryKeys.push(qk);
    }

    if (pattern.includes("{")) {
      const cleanPattern = pattern.split("{")[0];
      if (cleanPattern) {
        const basePath = cleanPattern.endsWith("/")
          ? cleanPattern.slice(0, -1)
          : cleanPattern;

        if (!basePath || basePath === "/" || basePath.trim() === "") {
          return Promise.resolve();
        }

        return Promise.all([
          defaultCacheStore.delete(basePath),
          defaultCacheStore.invalidateByPrefix(basePath + "/"),
          defaultCacheStore.invalidateByPrefix(basePath + ":"),
        ]).then(() => {});
      }
      return Promise.resolve();
    }

    return Promise.all([
      defaultCacheStore.delete(pattern),
      defaultCacheStore.invalidateByPrefix(pattern + ":"),
    ]).then(() => {});
  });

  await Promise.all(invalidationPromises);

  if (globalSocketEmitter && queryKeys.length > 0) {
    globalSocketEmitter([...rooms], queryKeys);
  }
}
