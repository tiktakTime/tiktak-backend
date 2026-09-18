/**
 * Cache tag kaydı — hangi mantıksal tag hangi route'ları etkiliyor.
 * `write.purge` sonrası ilgili route'ların FE query-key'leri invalidate edilir.
 */
import type { RouteLike } from "@/core/cache";

const routesByTag = new Map<string, RouteLike[]>();

/** Mantıksal tag'leri scope prefix'iyle nitele (`org:123:person`). */
export function qualifyTags(
  logical: string[],
  prefix: string | undefined,
): string[] {
  if (!prefix) return logical;
  return logical.map((t) => `${prefix}:${t}`);
}

export function registerTags(logicalTags: string[], route: RouteLike): void {
  for (const tag of logicalTags) {
    const list = routesByTag.get(tag) ?? [];
    if (!list.includes(route)) list.push(route);
    routesByTag.set(tag, list);
  }
}

export function routesForPurgeTags(logicalTags: string[]): RouteLike[] {
  const seen = new Set<RouteLike>();
  const out: RouteLike[] = [];
  for (const tag of logicalTags) {
    for (const route of routesByTag.get(tag) ?? []) {
      if (!seen.has(route)) {
        seen.add(route);
        out.push(route);
      }
    }
  }
  return out;
}
