import type { MiddlewareHandler } from "hono";

import { AppError } from "@tiktak/core";
import { db } from "@tiktak/database";

interface CacheEntry {
  data: Array<string>;
  expiresAt: number;
}

const userMembershipsCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

export const organizationMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");

  if (!user) {
    throw new AppError("UNAUTHORIZED", "error.unauthorized");
  }

  const organizationId = c.req.param("orgId");

  if (organizationId) {
    c.set("organizationId", organizationId);

    if (c.get("isSuperAdmin")) {
      await next();
      return;
    }

    const cacheEntry = userMembershipsCache.get(user.id);
    const now = Date.now();

    let userMemberships: Array<string> | null = null;
    if (cacheEntry && cacheEntry.expiresAt > now) {
      userMemberships = cacheEntry.data;
    }

    if (!userMemberships?.length) {
      userMemberships = await getUserMemberships(user.id);
      userMembershipsCache.set(user.id, {
        data: Array.from(userMemberships),
        expiresAt: now + CACHE_TTL,
      });
    }

    const isMember = userMemberships.includes(organizationId);

    if (!isMember) {
      throw new AppError("FORBIDDEN", "error.forbidden");
    }

    await next();
    return;
  }

  throw new AppError("UNAUTHORIZED", "error.unauthorized");
};

async function getUserMemberships(userId: string): Promise<Array<string>> {
  const result = await db
    .selectFrom("person")
    .select(["organization_id"])
    .where("user_id", "=", userId)
    .where("deleted_at", "is", null)
    .execute();

  return result
    .map((row) => row.organization_id)
    .filter((id): id is string => id !== null);
}

export function clearAllMembershipCache(userId: string) {
  userMembershipsCache.delete(userId);
}

export default organizationMiddleware;
