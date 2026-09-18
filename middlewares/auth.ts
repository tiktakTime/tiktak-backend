import type { MiddlewareHandler } from "hono";

import { AppError } from "@/core/errors";
import { extractBearerToken } from "@/core/http";
import { getSession, verifyAccessToken } from "@/platform/auth";

/** Claim + Redis oturumundan context değişkenlerini yaz. */
async function applySessionClaims(
  c: Parameters<MiddlewareHandler>[0],
  claims: { sub: string; sid: string },
) {
  c.set("user_id", claims.sub);
  c.set("session_id", claims.sid);
  const session = await getSession(claims.sid);
  if (!session) return;

  if (session.organization_id) {
    c.set("organization_id", session.organization_id);
  }
  c.set("permissions", session.permissions ?? []);
  c.set("person_id", session.person_id ?? null);
  c.set("role_id", session.role_id ?? null);
  c.set("is_super_admin", session.is_super_admin ?? false);
}

/**
 * Geçerli access JWT zorunlu; Redis oturumu hâlâ açık olmalı.
 * Context’e `user_id`, `session_id`, `organization_id` yazar.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = extractBearerToken(c.req.header("authorization"));
  if (!token) throw new AppError("MISSING_BEARER");

  try {
    const claims = await verifyAccessToken(token);
    await applySessionClaims(c, claims);
  } catch {
    throw new AppError("INVALID_TOKEN_AUTH");
  }

  await next();
};

/**
 * Bearer varsa oturumu context’e yazar; yoksa devam eder.
 * Cache prefix (user/org) için common/web yüzeylerinde kullanılır.
 */
export const optionalAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const token = extractBearerToken(c.req.header("authorization"));
  if (token) {
    try {
      const claims = await verifyAccessToken(token);
      await applySessionClaims(c, claims);
    } catch {
      // optional — ignore invalid token
    }
  }
  await next();
};
