import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "@tiktak/core";
import { env } from "@tiktak/env";

const productionPublicRouteTags: string[] = [];

export default function configureOpenAPI(app: AppOpenAPI) {
  const isProduction = env.NODE_ENV === "production";

  if (isProduction) {
    app.get("/no-index-openapi-doc", async (c) => {
      const doc = app.getOpenAPIDocument({
        openapi: "3.0.0",
        info: {
          version: "1.0.0",
          title: "Tiktak Backend API",
        },
      });

      if (doc.paths) {
        const filteredPaths: typeof doc.paths = {};
        for (const [path, methods] of Object.entries(doc.paths)) {
          if (typeof methods === "object" && methods !== null) {
            const filteredMethods: typeof methods = {};
            for (const [method, operation] of Object.entries(methods)) {
              if (
                typeof operation === "object" &&
                operation !== null &&
                "tags" in operation &&
                Array.isArray(operation.tags) &&
                operation.tags.some((tag: string) =>
                  productionPublicRouteTags.includes(tag),
                )
              ) {
                (filteredMethods as Record<string, unknown>)[method] =
                  operation;
              }
            }
            if (Object.keys(filteredMethods).length > 0) {
              filteredPaths[path] = filteredMethods;
            }
          }
        }
        doc.paths = filteredPaths;
      }

      return c.json(doc);
    });
  } else {
    app.doc("/doc", {
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Tiktak Backend API",
      },
    });
  }

  app.get(
    "/ui",
    Scalar({
      url: isProduction
        ? `${env.API_BASE_PATH}/no-index-openapi-doc`
        : `${env.API_BASE_PATH}/doc`,
      theme: "default",
      layout: "modern",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  );

  app.openAPIRegistry.registerComponent("securitySchemes", "bearer", {
    type: "http",
    scheme: "bearer",
  });
}
