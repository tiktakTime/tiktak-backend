/**
 * Domain hataları — HTTP/OpenAPI bilgisi taşımaz (yaprak modül).
 * HTTP status: i18n/catalog.meta.ts → render. Mesaj: i18n/<locale>/errors.json.
 */
import type { ErrorKey } from "@/core/http/catalog";

/** Base HTTP status haritası — OpenAPI standart hata yanıtları + HTTPException. */
export const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/** OpenAPI Failure açıklamaları — derleme anında i18n gerekmez. */
export const BASE_ERROR_TITLES: Record<ErrorCode, string> = {
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  CONFLICT: "Conflict",
  VALIDATION_ERROR: "Validation failed",
  TOO_MANY_REQUESTS: "Too many requests",
  INTERNAL_ERROR: "Something went wrong",
};

/**
 * Uygulama içinde fırlatılan hata — katalog anahtarı + opsiyonel interpolasyon params.
 * @example throw new AppError("EMAIL_ALREADY_EXISTS");
 */
export class AppError extends Error {
  constructor(
    readonly key: ErrorKey,
    readonly params?: Record<string, unknown>,
  ) {
    super(key);
    this.name = "AppError";
  }
}
