import type { Context, MiddlewareHandler } from "hono";

import { AppError } from "@/core/errors";
import type { AppBindings } from "@/core/router";

type AppContext = Context<AppBindings>;

/** Oturumda user_id zorunlu. */
export function assertMember(c: AppContext): string {
  const userId = c.get("user_id");
  if (!userId) throw new AppError("MISSING_SESSION");
  return userId;
}

/** Oturumda organization_id zorunlu. */
export function assertOrganization(c: AppContext): string {
  assertMember(c);
  const organizationId = c.get("organization_id");
  if (!organizationId) {
    throw new AppError("ORGANIZATION_ID_REQUIRED");
  }
  return organizationId;
}

/** Super-admin bypass; aksi halde permissions slug içermeli. */
export function assertPermission(c: AppContext, slug: string): void {
  assertMember(c);
  if (c.get("is_super_admin")) return;
  const permissions = c.get("permissions") ?? [];
  if (!permissions.includes(slug)) {
    throw new AppError("FORBIDDEN");
  }
}

export const requireMember: MiddlewareHandler = async (c, next) => {
  assertMember(c);
  await next();
};

export const requireOrganization: MiddlewareHandler = async (c, next) => {
  assertOrganization(c);
  await next();
};

export function requirePermission(slug: string): MiddlewareHandler {
  return async (c, next) => {
    assertPermission(c, slug);
    await next();
  };
}
