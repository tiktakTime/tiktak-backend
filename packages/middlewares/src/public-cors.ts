import type { MiddlewareHandler } from "hono";

import { db } from "@tiktak/database";

const allowedOrigins = (
  process.env.ALLOWED_PUBLIC_ORIGINS ??
  process.env.APP_URL ??
  "http://localhost:3000"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  return allowedOrigins.some(
    (allowed) =>
      allowed === origin || origin.startsWith(allowed.replace(/\/$/, "")),
  );
}

export const publicCorsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header("Origin");
  const method = c.req.method;
  const orgId = c.req.param("orgId");
  const path = c.req.path;

  if (origin && !isOriginAllowed(origin)) {
    return c.json({ error: "CORS: External requests not allowed" }, 403);
  }

  if (origin && isOriginAllowed(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (method === "OPTIONS") {
    return c.json({}, 200);
  }

  if (path.startsWith("/p/asset")) {
    await next();
    return;
  }

  if (path.includes("/p/") && !orgId) {
    return c.json({ error: "CORS: Origin and slug required" }, 403);
  }

  if (path.includes("/p/") && orgId) {
    try {
      const organization = await db
        .selectFrom("Organization")
        .where("id", "=", orgId)
        .executeTakeFirst();

      if (!organization) {
        return c.json({ error: "Public organization not found" }, 404);
      }
    } catch (error) {
      console.error("Public CORS organization check error:", error);
      return c.json({ error: "CORS: Organization validation failed" }, 500);
    }
  }

  await next();
  return;
};

export default publicCorsMiddleware;
