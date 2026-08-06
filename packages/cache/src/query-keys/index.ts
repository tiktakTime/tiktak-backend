import { reactQueryKeyStrategy } from "./react-query";
import { unityKeyStrategy } from "./unity";
import type {
  InvalidateKeyType,
  InvalidateParams,
  QueryKeyStrategy,
} from "./types";

export * from "./types";
export * from "./react-query";
export * from "./unity";

const strategies: Record<string, QueryKeyStrategy> = {
  "react-query": reactQueryKeyStrategy,
  unity: unityKeyStrategy,
};

export function invalidateKey<R extends { method: string; path: string }>(
  route: R,
  params?: InvalidateParams<R>,
  type: InvalidateKeyType = "react-query",
): unknown[] | null {
  if (!type) return null;

  const strategy = strategies[type];
  if (!strategy) {
    return null;
  }

  return strategy.generateKey(route, params);
}
