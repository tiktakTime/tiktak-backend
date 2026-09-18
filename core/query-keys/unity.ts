import type { InvalidateParams, QueryKeyStrategy } from "./types";

/** HTTP metodu ve path’ten Unity operationId üret. */
export function routeToUnityOperationId(method: string, path: string): string {
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

export const unityKeyStrategy: QueryKeyStrategy = {
  type: "unity",
  /** Rota ve parametrelerden Unity invalidate anahtarı üret. */
  generateKey<R extends { method: string; path: string }>(
    route: R,
    params?: InvalidateParams<R>,
  ): unknown[] {
    const operationId = routeToUnityOperationId(route.method, route.path);
    const names = extractParams(route.path);
    const pathParams: Record<string, string> = {};

    if (params) {
      for (const n of names) {
        const val = (params as Record<string, unknown>)[n];
        if (val !== undefined && val !== null) pathParams[n] = String(val);
      }
    }

    const cleanQuery: Record<string, string> = {};
    if (params?.query) {
      for (const [k, v] of Object.entries(params.query)) {
        if (v !== undefined && v !== null) cleanQuery[k] = String(v);
      }
    }

    return [
      {
        operationId,
        route: route.path,
        method: route.method.toUpperCase(),
        params: pathParams,
        query: cleanQuery,
      },
    ];
  },
};
