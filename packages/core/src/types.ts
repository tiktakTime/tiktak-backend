import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { User } from "@tiktak/database";

export interface AppBindings {
  Variables: {
    logger?: unknown;
    user: User;
    organizationId?: string;
    isSuperAdmin?: boolean;
  };
  Bindings: {
    DATABASE_URL?: string;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
