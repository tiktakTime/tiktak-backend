import { type RouteConfig, createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { z } from "zod";

import type { AppBindings, AppRouteHandler } from "./types";

export type RouteLike = {
  path: string;
  method: string;
  prefix?: (c: Context<AppBindings>) => string;
};

export type CacheableRoute = RouteConfig &
  RouteLike & {
    ttl?: number;
    invalidates?: RouteLike[];
  };

export const UNAUTHORIZED_MESSAGE = "error.forbidden";

export const errorResponses = {
  badRequest: (message: string = "error.bad_request") => ({
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema(message),
      message,
    ),
  }),
  unauthorized: (message: string = "error.unauthorized") => ({
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema(message),
      message,
    ),
  }),
  forbidden: (message: string = UNAUTHORIZED_MESSAGE) => ({
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      createMessageObjectSchema(message),
      message,
    ),
  }),
  notFound: (message: string = "error.not_found") => ({
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema(message),
      message,
    ),
  }),
  conflict: (message: string = "error.conflict") => ({
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema(message),
      message,
    ),
  }),
  unprocessableEntity: (message: string = "error.unprocessable_entity") => ({
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createMessageObjectSchema(message),
      message,
    ),
  }),
  internalServerError: () => ({
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      createMessageObjectSchema("error.internal_server"),
      "error.internal_server",
    ),
  }),
} as const;

export const commonResponses = {
  ok: <T extends z.ZodType>(schema: T, description: string) => ({
    [HttpStatusCodes.OK]: jsonContent(schema, description),
  }),
  created: <T extends z.ZodType>(schema: T, description: string) => ({
    [HttpStatusCodes.CREATED]: jsonContent(schema, description),
  }),
  noContent: (description: string = "No content") => ({
    [HttpStatusCodes.NO_CONTENT]: { description },
  }),
  ...errorResponses,
} as const;

type ErrorResponseKeys = keyof typeof errorResponses;

type CommonErrorStatusCodes = {
  forbidden: 403;
  badRequest: 400;
  conflict: 409;
  notFound: 404;
  internalServerError: 500;
  unauthorized: 401;
  unprocessableEntity: 422;
};

export function createStandardRoute<
  P extends string,
  R extends Omit<RouteConfig, "path" | "method"> & {
    path: P;
    method?: RouteConfig["method"];
  },
  B extends z.ZodTypeAny = z.ZodTypeAny,
  CE extends readonly ErrorResponseKeys[] = readonly ErrorResponseKeys[],
>(
  config: R & {
    tag?: string;
    commonErrors?: CE;
    jsonBody?: {
      schema: B;
      description?: string;
    };
    auth?: boolean;
  },
) {
  const {
    tag,
    commonErrors = ["forbidden", "internalServerError"] as const,
    jsonBody,
    auth = true,
    ...routeConfig
  } = config;

  const { ttl, invalidates, prefix, ...cleanRouteConfig } =
    routeConfig as CacheableRoute;

  const finalResponses = { ...cleanRouteConfig.responses } as Record<
    string | number,
    unknown
  >;

  for (const error of commonErrors) {
    const errorFn = errorResponses[error as ErrorResponseKeys];
    const errorResponse = errorFn();
    const statusCode = Object.keys(errorResponse)[0];
    if (statusCode && !(statusCode in finalResponses)) {
      finalResponses[statusCode] = (
        errorResponse as Record<string | number, unknown>
      )[statusCode];
    }
  }

  const finalRequest = {
    ...cleanRouteConfig.request,
    ...(jsonBody
      ? {
          body: jsonContentRequired(
            jsonBody.schema,
            jsonBody.description ?? "Request body",
          ),
        }
      : {}),
  };

  const route = createRoute({
    ...cleanRouteConfig,
    tags: cleanRouteConfig.tags ?? (tag ? [tag] : []),
    security: cleanRouteConfig.security ?? (auth ? [{ bearer: [] }] : []),
    request: finalRequest,
    responses: finalResponses as R["responses"],
  });

  const routeWithCacheParams = {
    ...route,
    ...(ttl !== undefined ? { ttl } : {}),
    ...(invalidates !== undefined ? { invalidates } : {}),
    ...(prefix !== undefined ? { prefix } : {}),
  };

  return routeWithCacheParams as unknown as R & {
    method: R["method"] extends string ? R["method"] : "get";
    responses: R["responses"] & {
      [K in CE[number] as K extends keyof CommonErrorStatusCodes
        ? CommonErrorStatusCodes[K]
        : never]: {
        description: string;
        content: {
          "application/json": {
            schema: z.ZodObject<{ message: z.ZodString }>;
          };
        };
      };
    };
    request: {
      body: {
        content: {
          "application/json": {
            schema: B;
          };
        };
        required: true;
      };
    };
  };
}

export function createEndpoint<
  R extends CacheableRoute,
  H = AppRouteHandler<R>,
>(
  route: R,
  handle: H,
): { route: R; handle: H } {
  const cleanRoute = { ...route };
  delete cleanRoute.ttl;
  delete cleanRoute.invalidates;
  delete cleanRoute.prefix;

  return { route: cleanRoute as unknown as R, handle };
}
