import { OpenAPIHono } from "@hono/zod-openapi";
import { randomUUID } from "node:crypto";

import {
  errorHandler,
  notFoundHandler,
  validationHook,
} from "@/core/http/error-handler";
import { negotiateLocale } from "@/core/http/i18n";

import type { AppBindings, AppOpenAPI } from "./types";

/** Alt router; tüm 422 yanıtları aynı validation hook’u kullanır. */
export function createRouter(): AppOpenAPI {
  return new OpenAPIHono<AppBindings>({ defaultHook: validationHook });
}

/** Kök uygulama: locale, trace id, hata sınırı ve 404. */
export function createApp(): AppOpenAPI {
  const app = createRouter();

  app.use("*", async (c, next) => {
    const locale = negotiateLocale(c.req.header("accept-language"));
    c.set("locale", locale);
    c.set("trace_id", c.req.header("x-request-id") ?? randomUUID());
    await next();
    c.header("Content-Language", c.get("locale"));
    c.header("X-Trace-Id", c.get("trace_id"));
    c.header("x-request-id", c.get("trace_id"));
  });

  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  return app;
}
