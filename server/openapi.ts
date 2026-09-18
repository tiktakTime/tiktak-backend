import { Scalar } from "@scalar/hono-api-reference";

import { app_config } from "@/app.config";
import { env } from "@/core/env";
import type { AppOpenAPI } from "@/core/router";

/** OpenAPI spec ve Scalar docs uçlarını uygulamaya bağla. */
export function mountOpenAPI(app: AppOpenAPI) {
  app.openAPIRegistry.registerComponent("securitySchemes", "bearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  app.doc(app_config.openapi.spec_path, {
    openapi: "3.1.0",
    info: {
      title: app_config.openapi.title,
      version: app_config.openapi.version,
    },
  });

  // The spec stays reachable in production (clients generate from it); the
  // browsable UI does not.
  if (env.NODE_ENV !== "production") {
    app.get(
      app_config.openapi.docs_path,
      Scalar({ url: env.API_BASE_PATH + app_config.openapi.spec_path }),
    );
  }
}
