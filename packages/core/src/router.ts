import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { notFound, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { customErrorHandler } from "./error-handler";
import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });

  return app;
}

export function createApp() {
  const app = createRouter();
  app.use(serveEmojiFavicon("📝"));
  app
    .use(
      cors({
        origin: "*",
      }),
    )
    .use(prettyJSON())
    .use(secureHeaders({ crossOriginResourcePolicy: false }))
    .use(timing())
    .use(logger());

  app.notFound(notFound);
  app.onError(customErrorHandler);
  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
