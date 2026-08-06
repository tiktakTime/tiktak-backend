import type { MiddlewareHandler } from "hono";

import { AppError } from "@tiktak/core";

const protectedRoutes: Array<{ method: string; path: string }> = [];

const matchers = protectedRoutes.map((contract) => {
  const method = contract.method.toLowerCase();
  const escapedPath = contract.path.replace(/[.+*?^$()|[\]\\]/g, "\\$&");
  const regexPattern = escapedPath.replace(/\\{[^\\}]+\\}/g, "[^/]+");
  const regex = new RegExp(`^${regexPattern}/?$`);
  return { method, regex };
});

export const superAdminGuard: MiddlewareHandler = async (c, next) => {
  const reqMethod = c.req.method.toLowerCase();
  const reqPath = c.req.path;

  const requiresSuperAdmin = matchers.some((matcher) => {
    if (matcher.method !== reqMethod) return false;
    return matcher.regex.test(reqPath);
  });

  if (requiresSuperAdmin && !c.get("isSuperAdmin")) {
    throw new AppError("FORBIDDEN");
  }

  await next();
};

export default superAdminGuard;
