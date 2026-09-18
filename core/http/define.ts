/**
 * Slice route tanımı — `defineRoute({ … })`.
 *
 * `any` bu dosyada bilinçli: `RouteDef.handle` tip-silinmiş imzayla saklanır,
 * tip çıkarımı `defineRoute` generic'lerinde yapılır. Daraltmak `createSlice`'a
 * verilen heterojen dizileri atanamaz hale getirir.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- tip-silinmiş RouteDef; çıkarım defineRoute generic'lerinde */
import type { RouteConfig } from "@hono/zod-openapi";
import { type z } from "@hono/zod-openapi";
import type { Context } from "hono";

import type { AppBindings } from "@/core/router";

import type { ResponseSpec, ZodLike } from "./response-spec";

export type RouteCacheRead = {
  ttl: number;
  tags?: string[];
};

export type RouteCacheWrite = {
  purge: string[];
};

export type RouteCacheConfig = {
  read?: RouteCacheRead;
  write?: RouteCacheWrite;
};

export type RouteCtx<
  P = Record<string, never>,
  Q = Record<string, never>,
  B = Record<string, never>,
> = {
  params: P;
  query: Q;
  body: B;
  /** Aktif tenant (ürün: organization) — `resolveTenantId`. */
  tenantId: string;
  /** Oturum sahibi (ürün: member/user) — `resolveActorId`. */
  actorId: string;
  c: Context<AppBindings>;
};

type InferOrEmpty<T> = T extends z.ZodTypeAny
  ? z.infer<T>
  : Record<string, never>;

export type RouteDef = {
  /** Benzersiz isim + katalog anahtarı (`organization.delete`). */
  name: string;
  method: NonNullable<RouteConfig["method"]>;
  path: string;
  summary?: string;
  /** OpenAPI tag (tek). */
  tag?: string;
  /** default `"bearer"`. */
  security?: "bearer" | "none";
  /** default `"none"`. */
  tenant?: string;
  /** AND. */
  policy?: string[];
  request?: {
    params?: ZodLike;
    query?: ZodLike;
    body?: ZodLike;
    headers?: ZodLike;
    cookies?: ZodLike;
  };
  response: ResponseSpec;
  cache?: RouteCacheConfig;
  handle: (ctx: RouteCtx<any, any, any>) => unknown | Promise<unknown>;
};

/**
 * Kimlik fonksiyonu — runtime'da iş yapmaz; `request` → `handle` tip çıkarımı.
 */
export function defineRoute<
  TParams extends ZodLike | undefined = undefined,
  TQuery extends ZodLike | undefined = undefined,
  TBody extends ZodLike | undefined = undefined,
>(def: {
  name: string;
  method: RouteDef["method"];
  path: string;
  summary?: string;
  tag?: string;
  security?: RouteDef["security"];
  tenant?: string;
  policy?: string[];
  request?: {
    params?: TParams;
    query?: TQuery;
    body?: TBody;
    headers?: ZodLike;
    cookies?: ZodLike;
  };
  response: ResponseSpec;
  cache?: RouteCacheConfig;
  handle: (
    ctx: RouteCtx<
      InferOrEmpty<TParams>,
      InferOrEmpty<TQuery>,
      InferOrEmpty<TBody>
    >,
  ) => unknown | Promise<unknown>;
}): RouteDef {
  return def as RouteDef;
}
