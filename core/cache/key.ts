import type { Context } from "hono";

export type RouteLike = {
  path: string;
  method: string;
  /** Scope prefix (`{kind}:{id}`) — falsy ise scoped route cache atlanır. */
  prefix?: (c: Context) => string | undefined;
};

/** Path şablonundaki parametre yer tutucularını gerçek değerlerle değiştir. */
export function substituteParams(
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

/** İstek rotası ve query’den yanıt cache anahtarı üret. Scoped prefix yoksa `null`. */
export function buildCacheKeyFromRoute(
  route: RouteLike,
  c: Context,
): string | null {
  const params = { ...c.req.param() };
  const queries: Record<string, string[]> = c.req.queries?.() ?? {};

  const queryEntries = Object.entries(queries)
    .filter(([, v]) => v.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const queryHash =
    queryEntries.length > 0
      ? `:${JSON.stringify(Object.fromEntries(queryEntries.map(([k, v]) => [k, v[0]])))}`
      : "";

  const url = substituteParams(route.path, params);
  const prefix = route.prefix?.(c);
  if (route.prefix && !prefix) return null;
  return (prefix ? `${prefix}||` : "") + url + queryHash;
}
