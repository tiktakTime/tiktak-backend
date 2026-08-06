import type { InvalidateParams, QueryKeyStrategy } from "./types";

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

function extractParams(path: string): string[] {
  return path
    .split("/")
    .filter((s) => s.startsWith("{") && s.endsWith("}"))
    .map((s) => s.slice(1, -1));
}

export const reactQueryKeyStrategy: QueryKeyStrategy = {
  type: "react-query",
  generateKey<R extends { method: string; path: string }>(
    route: R,
    params?: InvalidateParams<R>,
  ): unknown[] {
    const key = routeToQueryKey(route.method, route.path);
    if (!params) return [key];

    const names = extractParams(route.path);
    const pathParams: Record<string, string> = {};
    for (const n of names) {
      const val = (params as any)[n];
      if (val !== undefined && val !== null) pathParams[n] = String(val);
    }

    const result: any = {};
    if (Object.keys(pathParams).length > 0) result.path = pathParams;

    if (params.query && Object.keys(params.query).length > 0) {
      const cleanQuery: Record<string, any> = {};
      for (const [k, v] of Object.entries(params.query)) {
        if (v !== undefined && v !== null) cleanQuery[k] = v;
      }
      if (Object.keys(cleanQuery).length > 0) {
        result.query = cleanQuery;
      }
    }

    return Object.keys(result).length > 0 ? [key, result] : [key];
  },
};
