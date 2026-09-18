/**
 * Hono adaptörleri — onError / notFound / validationHook → `render`.
 */
import type { Hook } from "@hono/zod-openapi";
import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ZodError } from "zod";

import { env } from "@/core/env";
import { AppError, ERROR_CODES, type ErrorCode } from "@/core/errors/errors";
import type { AppBindings } from "@/core/router/types";

import { renderError, renderValidation } from "./render";

/** Başarısız istek doğrulamasını VALIDATION_ERROR zarfına çevir. */
export const validationHook: Hook<unknown, AppBindings, string, unknown> = (
  result,
  c,
) => {
  if (result.success) return;
  return c.json(...renderValidation(c, (result.error as ZodError).issues));
};

/** Bilinmeyen rota için 404 zarfı. */
export const notFoundHandler: NotFoundHandler<AppBindings> = (c) =>
  c.json(...renderError(c, { key: "NOT_FOUND" }));

/** Yakalanan hataları API zarfına dönüştür. */
export const errorHandler: ErrorHandler<AppBindings> = (error, c) => {
  if (error instanceof AppError) {
    return c.json(
      ...renderError(c, {
        key: error.key,
        params: error.params,
      }),
    );
  }

  if (error instanceof HTTPException) {
    const code = (Object.keys(ERROR_CODES) as ErrorCode[]).find(
      (key) => ERROR_CODES[key] === error.status,
    );
    return c.json(
      ...renderError(c, {
        key: code ?? "BAD_REQUEST",
        debugDetail: error.message,
      }),
    );
  }

  console.error(`[${c.get("trace_id")}] unhandled error:`, error);

  return c.json(
    ...renderError(c, {
      key: "INTERNAL_ERROR",
      debugDetail: env.NODE_ENV === "development" ? String(error) : undefined,
    }),
  );
};
