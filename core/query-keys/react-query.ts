import type { InvalidateParams, QueryKeyStrategy } from "./types";

/** HTTP metodu ve path’ten React Query anahtar adını üret. */
export function routeToQueryKey(method: string, path: string): string {
  const methodCap =
    method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  const parts = path
    .split("/")
    .filter(Boolean)
    .map((s) => {
      if (s.startsWith("{") && s.endsWith("}"))
        return "By" + s.slice(1, -1).replace(/^./, (c) => c.toUpperCase());
      return s
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
    });
  return methodCap + parts.join("");
}

/** Path şablonundaki parametre adlarını çıkar. */
function extractParams(path: string): string[] {
  return path
    .split("/")
    .filter((s) => s.startsWith("{") && s.endsWith("}"))
    .map((s) => s.slice(1, -1));
}

/** `null` / `undefined` alanları at; boşsa `undefined` dön. */
function compact(
  source: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value !== null) out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Path şablonundaki parametreleri string'e çevirip topla. */
function collectPathParams(
  path: string,
  params: Record<string, unknown>,
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const name of extractParams(path)) {
    const value = params[name];
    if (value !== undefined && value !== null) out[name] = String(value);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export const reactQueryKeyStrategy: QueryKeyStrategy = {
  type: "react-query",
  /** Rota ve parametrelerden React Query invalidate anahtarı üret. */
  generateKey<R extends { method: string; path: string }>(
    route: R,
    params?: InvalidateParams<R>,
  ): unknown[] {
    const key = routeToQueryKey(route.method, route.path);
    if (!params) return [key];

    const path = collectPathParams(
      route.path,
      params as Record<string, unknown>,
    );
    const query = params.query ? compact(params.query) : undefined;

    const result = {
      ...(path ? { path } : {}),
      ...(query ? { query } : {}),
    };

    return Object.keys(result).length > 0 ? [key, result] : [key];
  },
};
