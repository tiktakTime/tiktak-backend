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
    const firebaseUser = await verifyFirebaseToken(token);

    let dbUser = await db
      .selectFrom("User")
      .selectAll()
      .where("id", "=", firebaseUser.id)
      .executeTakeFirst();

    if (!dbUser) {
      const defaultEmail =
        firebaseUser.email || `${firebaseUser.id}@noemail.local`;
      const defaultName =
        firebaseUser.name || `User ${firebaseUser.id.substring(0, 6)}`;

      dbUser = await db
        .insertInto("User")
        .values({
          id: firebaseUser.id,
          email: defaultEmail,
          name: defaultName,
          avatar: firebaseUser.avatar,
          isVerified: firebaseUser.isVerified,
          isBanned: false,
          isDeleted: false,
          isSuperAdmin: firebaseUser.isSuperAdmin,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!dbUser) {
        throw new Error("Failed to create user in database");
      }
    }

    if (dbUser.isBanned) {
      throw new AppError("FORBIDDEN", "error.user_banned");
    }

    if (dbUser.isDeleted) {
      throw new AppError("UNAUTHORIZED", "error.user_deleted");
    }

    c.set("user", dbUser);
    c.set("isSuperAdmin", dbUser.isSuperAdmin === true);

    await next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[Auth Middleware] Unexpected error:", error);
    throw new AppError("UNAUTHORIZED", "error.unauthorized");
  }
};

export default authMiddleware;
