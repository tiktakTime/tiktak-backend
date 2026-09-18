/**
 * Tek render hunisi — başarı + hata + validation → wire zarfı.
 * Locale, interpolasyon ve Content-Language burada çözülür.
 */
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ZodIssue } from "zod";

import { env } from "@/core/env";
import type { AppBindings } from "@/core/router/types";

import type { ApiSemanticStatus, ErrorKey, SuccessKey } from "./catalog";
import {
  lookupErrorMeta,
  negotiateLocale,
  resolveError,
  resolveSuccess,
  resolveValidation,
} from "./i18n";
import type { ApiEnvelope, ApiFieldError } from "./result";

export function localeOf(c: Context<AppBindings>): string {
  return c.get("locale") ?? negotiateLocale(c.req.header("accept-language"));
}

export function applyResponseHeaders(
  c: Context<AppBindings>,
  locale = localeOf(c),
) {
  const traceId = c.get("trace_id");
  c.header("Content-Language", locale);
  if (traceId) c.header("X-Trace-Id", traceId);
}

/** Başarı zarfı — mutation'da title/message dolu; GET'te katalog yoksa null. */
export function renderSuccess<T>(
  c: Context<AppBindings>,
  options: {
    code: SuccessKey | string;
    data: T | null;
    params?: Record<string, unknown>;
  },
): ApiEnvelope<T> {
  const locale = localeOf(c);
  applyResponseHeaders(c, locale);

  const resolved = resolveSuccess(options.code, locale, options.params ?? {});
  return {
    status: "success",
    code: options.code,
    title: resolved.found ? resolved.title : null,
    message: resolved.found ? resolved.message : null,
    data: options.data ?? null,
  };
}

/** Hata zarfı — her zaman title/message + meta.trace_id. */
export function renderError(
  c: Context<AppBindings>,
  options: {
    key: ErrorKey | string;
    params?: Record<string, unknown>;
    errors?: ApiFieldError[];
    /** Katalogda yoksa debug meta (yalnızca development). */
    debugDetail?: string;
  },
): [ApiEnvelope, ContentfulStatusCode] {
  const locale = localeOf(c);
  applyResponseHeaders(c, locale);

  const meta = lookupErrorMeta(options.key);
  const resolved = resolveError(options.key, locale, options.params ?? {});
  const status = (resolved.found ? meta.status : 500) as ContentfulStatusCode;
  const severity: ApiSemanticStatus = meta.severity ?? "error";

  const body: ApiEnvelope = {
    status: severity,
    code: resolved.found ? options.key : "INTERNAL_ERROR",
    title: resolved.title,
    message: resolved.message,
    data: null,
    meta: {
      trace_id: c.get("trace_id"),
      ...(env.NODE_ENV === "development" && options.debugDetail
        ? { detail: options.debugDetail }
        : {}),
    },
  };

  if (options.errors?.length) {
    body.errors = options.errors;
  }

  return [body, status];
}

const PARAM_KEYS = [
  "maximum",
  "minimum",
  "expected",
  "received",
  "format",
  "origin",
  "values",
  "divisor",
] as const;

type KnownOrigin = "string" | "number" | "array" | "date";
type KnownFormat = "email" | "uuid" | "url" | "datetime" | "regex";

function asKnownOrigin(value: unknown): KnownOrigin | null {
  return value === "string" ||
    value === "number" ||
    value === "array" ||
    value === "date"
    ? value
    : null;
}

function asKnownFormat(value: unknown): KnownFormat | null {
  return value === "email" ||
    value === "uuid" ||
    value === "url" ||
    value === "datetime" ||
    value === "regex"
    ? value
    : null;
}

/**
 * Zod issue → ValidationKey.
 * `code` üzerinde exhaustive switch; tanınmayan origin/format → `"unknown"`.
 */
export function validationKeyOf(issue: ZodIssue): string {
  const source = issue as unknown as Record<string, unknown>;

  switch (issue.code) {
    case "invalid_type":
      return "invalid_type";
    case "too_big": {
      const origin = asKnownOrigin(source.origin);
      return origin ? `too_big.${origin}` : "unknown";
    }
    case "too_small": {
      const origin = asKnownOrigin(source.origin);
      return origin ? `too_small.${origin}` : "unknown";
    }
    case "invalid_format": {
      const format = asKnownFormat(source.format);
      return format ? `invalid_format.${format}` : "unknown";
    }
    case "not_multiple_of":
      return "not_multiple_of";
    case "unrecognized_keys":
      return "unrecognized_keys";
    case "invalid_union":
      return "invalid_union";
    case "invalid_key":
      return "invalid_key";
    case "invalid_element":
      return "invalid_element";
    case "invalid_value":
      return "invalid_value";
    case "custom":
      return "custom";
    default:
      return "unknown";
  }
}

function issueParams(issue: ZodIssue): Record<string, unknown> {
  const source = issue as unknown as Record<string, unknown>;
  const params: Record<string, unknown> = {};
  for (const key of PARAM_KEYS) {
    if (source[key] !== undefined) params[key] = source[key];
  }
  return params;
}

export function renderValidation(
  c: Context<AppBindings>,
  issues: ZodIssue[],
): [ApiEnvelope, ContentfulStatusCode] {
  const locale = localeOf(c);
  const errors: ApiFieldError[] = issues.map((issue) => {
    const key = validationKeyOf(issue);
    const resolved = resolveValidation(key, locale, issueParams(issue));
    return {
      field: issue.path.join(".") || null,
      code: resolved.code,
      message: resolved.message,
    };
  });

  return renderError(c, {
    key: "VALIDATION_ERROR",
    errors: errors.length
      ? errors
      : [
          {
            field: null,
            code: "unknown",
            message: resolveValidation("unknown", locale).message,
          },
        ],
  });
}
