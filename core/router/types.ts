import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

/**
 * Hono / OpenAPI uygulama bağlamı.
 * RBAC alanları `platform/auth/context.ts` ile genişletilir.
 */
export interface AppVariables {
  /** Same id appears in the error response and in logs. */
  trace_id: string;
  /** Negotiated from Accept-Language. */
  locale: string;
}

export interface AppBindings {
  Variables: AppVariables;
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
