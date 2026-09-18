/**
 * Route platform wiring — core'un domain'e açtığı port.
 * Boot: `server/buildServer()` içinde `configureRoutePlatform` çağrılır.
 */
import type { Context, MiddlewareHandler } from "hono";

import type { AppBindings } from "@/core/router";

export type ScopeRegistration = {
  middleware: MiddlewareHandler;
  cacheKey: (c: Context<AppBindings>) => string | undefined;
};

export type RoutePlatformConfig = {
  scopes: Record<string, ScopeRegistration>;
  checkPolicy?: (c: Context<AppBindings>, policy: string[]) => void;
  /** Cache/socket öncesi context hydrate (ürün anahtarları). */
  hydrateScope?: (c: Context<AppBindings>) => void;
  resolveTenantId: (c: Context<AppBindings>) => string;
  resolveActorId: (c: Context<AppBindings>) => string;
};

let platform: RoutePlatformConfig | null = null;

/** Derleme sırasında görülen tenant'lar — konfigürasyon anında doğrulanır. */
const requiredTenants = new Set<string>();

/** `compileRouteDef` her slice tenant'ını buraya bildirir. */
export function registerRequiredTenant(tenant: string): void {
  requiredTenants.add(tenant);
}

function unknownTenant(tenant: string): Error {
  return new Error(
    `Unknown route tenant "${tenant}". Register it in configureRoutePlatform({ scopes })`,
  );
}

export function configureRoutePlatform(config: RoutePlatformConfig) {
  for (const tenant of requiredTenants) {
    if (!config.scopes[tenant]) throw unknownTenant(tenant);
  }
  platform = config;
}

export function requirePlatform(): RoutePlatformConfig {
  if (!platform) {
    throw new Error(
      "configureRoutePlatform() must run before handling requests (see server/index.ts)",
    );
  }
  return platform;
}

/**
 * Scope kaydını istek anında çöz.
 * Slice'lar `createSlice`'ı modül yüklenirken çağırır; platform ise `buildServer()`
 * içinde kurulur — bu yüzden platform aramaları asla derleme anında yapılmaz.
 */
export function scopeFor(tenant: string): ScopeRegistration {
  const reg = requirePlatform().scopes[tenant];
  if (!reg) throw unknownTenant(tenant);
  return reg;
}

/** Aktif tenant id — ürün çözücüsü boot'ta verilir. */
export function tenantId(c: Context<AppBindings>): string {
  return requirePlatform().resolveTenantId(c);
}

/** İsteği yapan aktör id — ürün çözücüsü boot'ta verilir. */
export function actorId(c: Context<AppBindings>): string {
  return requirePlatform().resolveActorId(c);
}
