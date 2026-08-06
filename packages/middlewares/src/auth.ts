import type { MiddlewareHandler } from "hono";

import { verifyFirebaseToken } from "@tiktak/auth";
import { AppError } from "@tiktak/core";
import { type User, db } from "@tiktak/database";

declare module "hono" {
  interface ContextVariableMap {
    user: User;
    isSuperAdmin: boolean;
    organizationId?: string;
  }
}

function splitDisplayName(name: string): { first_name: string; last_name: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { first_name: "User", last_name: "-" };
  }
  const parts = trimmed.split(/\s+/);
  const first_name = parts[0] ?? "User";
  const last_name = parts.slice(1).join(" ") || "-";
  return { first_name, last_name };
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");

  if (user) {
    await next();
    return;
  }

  const authHeader = c.req.header("authorization");
  if (!authHeader) {
    throw new AppError("UNAUTHORIZED", "error.unauthorized");
  }

  const token = authHeader
    .trim()
    .replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) {
    throw new AppError("UNAUTHORIZED", "error.unauthorized");
  }

  try {
    const identity = await verifyFirebaseToken(token);

    let dbUser = await db
      .selectFrom("user")
      .selectAll()
      .where("id", "=", identity.id)
      .executeTakeFirst();

    if (!dbUser) {
      const defaultEmail =
        identity.email || `${identity.id}@noemail.local`;
      const { first_name, last_name } = splitDisplayName(
        identity.name || `User ${identity.id.substring(0, 6)}`,
      );

      dbUser = await db
        .insertInto("user")
        .values({
          id: identity.id,
          email: defaultEmail,
          first_name,
          last_name,
          image: identity.avatar,
          is_email_verified: identity.isVerified,
        })
        .returningAll()
        .executeTakeFirst();

      if (!dbUser) {
        throw new Error("Failed to create user in database");
      }
    }

    if (dbUser.status === "blocked") {
      throw new AppError("FORBIDDEN", "error.user_banned");
    }

    if (dbUser.deleted_at) {
      throw new AppError("UNAUTHORIZED", "error.user_deleted");
    }

    c.set("user", dbUser);
    // Super-admin via system_role lands in Faz 1 auth; claim only for now.
    c.set("isSuperAdmin", identity.isSuperAdmin === true);

    await next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[Auth Middleware] Unexpected error:", error);
    throw new AppError("UNAUTHORIZED", "error.unauthorized");
  }
};

export default authMiddleware;
