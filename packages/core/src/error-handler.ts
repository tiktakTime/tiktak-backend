import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { env } from "@tiktak/env";

import type { AppBindings } from "./types";

export type AppErrorCode =
  | "ENTITY_NOT_FOUND"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "USER_NOT_FOUND"
  | "USER_NOT_MEMBER"
  | "ORGANIZATION_NOT_FOUND"
  | "ENTITY_ALREADY_EXISTS"
  | "SLUG_ALREADY_EXISTS"
  | "TOO_MANY_REQUESTS";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "AppError";
  }
}

const statusMap: Record<AppErrorCode, ContentfulStatusCode> = {
  ENTITY_NOT_FOUND: 404,
  USER_NOT_FOUND: 404,
  ORGANIZATION_NOT_FOUND: 404,
  USER_NOT_MEMBER: 400,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  ENTITY_ALREADY_EXISTS: 409,
  SLUG_ALREADY_EXISTS: 409,
  TOO_MANY_REQUESTS: 429,
};

function cleanStack(stack?: string): string[] | undefined {
  if (!stack) return undefined;
  return stack
    .split("\n")
    .map((line) => line.trim())
    .slice(0, 5);
}

export const customErrorHandler: ErrorHandler<AppBindings> = (err, c) => {
  if (err instanceof HTTPException) {
    const code: AppErrorCode =
      err.status === 404
        ? "ENTITY_NOT_FOUND"
        : err.status === 401
          ? "UNAUTHORIZED"
          : err.status === 403
            ? "FORBIDDEN"
            : "BAD_REQUEST";
    return c.json(
      {
        code,
        message: err.message.startsWith("error.")
          ? err.message
          : `error.${code.toLowerCase()}`,
        ...(env.NODE_ENV === "development"
          ? { error: err.message, stack: cleanStack(err.stack) }
          : {}),
      },
      err.status,
    );
  }
  if (err instanceof AppError) {
    const status = statusMap[err.code] ?? 500;
    return c.json(
      {
        code: err.code,
        message: err.message.startsWith("error.")
          ? err.message
          : `error.${err.code.toLowerCase()}`,
        ...(env.NODE_ENV === "development"
          ? { error: err.message, stack: cleanStack(err.stack) }
          : {}),
      },
      status,
    );
  }

  console.error("[Unhandled System Error]:", err);

  return c.json(
    {
      code: "INTERNAL_SERVER_ERROR",
      message: "error.internal_server",
      ...(env.NODE_ENV === "development"
        ? { error: err.message, stack: cleanStack(err.stack) }
        : {}),
    },
    500,
  );
};
