/**
 * API yanıt zarfları — işlem (`ApiEnvelope`) / liste (`PageResponse`) + OpenAPI.
 */
import { getRefId } from "@asteasolutions/zod-to-openapi";
import { z } from "@hono/zod-openapi";

import type { ApiSemanticStatus, SuccessKey } from "./catalog";

export type { ApiSemanticStatus } from "./catalog";

/** Validation / alan hataları — yalnızca hata zarfında. */
export interface ApiFieldError {
  field: string | null;
  code: string;
  message: string;
}

/** İşlem zarfı — mutation, tekil GET ve tüm hatalar. */
export interface ApiEnvelope<T = unknown> {
  status: ApiSemanticStatus;
  code: string;
  title: string | null;
  message: string | null;
  errors?: ApiFieldError[];
  data: T | null;
  meta?: { trace_id: string; detail?: string };
}

export interface PageMeta {
  total: number;
  page: number;
}

/** Sayfalı liste zarfı — bildirim taşımaz. */
export interface PageResponse<T = unknown> {
  data: T[];
  empty: boolean;
  pagination: PageMeta;
}

/**
 * Domain başarı override — route `name` yerine bu katalog anahtarı kullanılır.
 * @example return ok("access.already-existed", existing);
 */
export type NamedSuccess<T = unknown> = {
  readonly __named: true;
  readonly code: SuccessKey | string;
  readonly data: T;
  readonly params?: Record<string, unknown>;
};

export function ok<T>(
  code: SuccessKey | string,
  data: T,
  params?: Record<string, unknown>,
): NamedSuccess<T> {
  return { __named: true, code, data, params };
}

export function isNamedSuccess(value: unknown): value is NamedSuccess {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as NamedSuccess).__named === true &&
    typeof (value as NamedSuccess).code === "string"
  );
}

/** Search/list GET zarfı — `Page()` OpenAPI spec ile uyumlu. */
export function toPage<T>(
  data: T[],
  total: number,
  page: number,
): PageResponse<T> {
  return {
    data,
    empty: data.length === 0,
    pagination: { total, page },
  };
}

// ── OpenAPI şemaları ────────────────────────────────────────

export const ApiFieldErrorSchema = z
  .object({
    field: z.string().nullable(),
    code: z.string(),
    message: z.string(),
  })
  .openapi("ApiFieldError");

export const PageMetaSchema = z
  .object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
  })
  .openapi("PageMeta");

/**
 * `.openapi("Resource")` ile verilen component adı.
 * Adsız şemalarda `undefined` — zarf o zaman isimlendirilmez ve spec’e inline gömülür.
 */
export function refNameOf(schema: z.ZodType): string | undefined {
  return getRefId(schema);
}

/** İşlem zarfı OpenAPI: `{ status, code, title, message, data }`. */
export function resultSchema<T extends z.ZodType>(data: T, name?: string) {
  const schema = z.object({
    status: z.enum(["success", "info", "warning", "error"]),
    code: z.string(),
    title: z.string().nullable(),
    message: z.string().nullable(),
    errors: z.array(ApiFieldErrorSchema).optional(),
    data: data.nullable(),
    meta: z
      .object({
        trace_id: z.string(),
        detail: z.string().optional(),
      })
      .optional(),
  });
  return name ? schema.openapi(name) : schema;
}

/** Liste zarfı OpenAPI: `{ data, empty, pagination }`. */
export function pageSchema<T extends z.ZodType>(item: T, name?: string) {
  const schema = z.object({
    data: z.array(item),
    empty: z.boolean(),
    pagination: PageMetaSchema,
  });
  return name ? schema.openapi(name) : schema;
}

/** Hata zarfı OpenAPI — veri taşımayan `resultSchema`. */
export const ErrorEnvelopeSchema = resultSchema(z.unknown(), "ApiEnvelope");

/** @deprecated Eski `messages[]` tipi — yeni wire `errors[]` kullanır. */
export type ApiMessage = {
  field: string | null;
  message: string;
  meta?: Record<string, unknown>;
};
