import { z } from "zod";

export type InvalidateKeyType = "react-query" | "unity" | null;

export type UrlParams<T extends string> =
  T extends `${string}{${infer P}}${infer R}`
    ? { [K in P]: string | number } & UrlParams<R>
    : {};

type Flatten<T> = { [K in keyof T]: T[K] } & {};

type InferRouteParams<R> = R extends {
  request: { params: z.ZodType<any, any, any> };
}
  ? z.input<R["request"]["params"]>
  : R extends { path: infer T }
    ? T extends string
      ? UrlParams<T>
      : Record<string, any>
    : Record<string, any>;

type InferRouteQuery<R> = R extends {
  request: { query: z.ZodType<any, any, any> };
}
  ? z.input<R["request"]["query"]>
  : Record<string, never>;

export type InvalidateParams<R extends { path: string }> = Flatten<
  InferRouteParams<R> & { query?: InferRouteQuery<R> }
>;

export interface QueryKeyStrategy {
  type: InvalidateKeyType;
  generateKey<R extends { method: string; path: string }>(
    route: R,
    params?: InvalidateParams<R>,
  ): unknown[] | null;
}
