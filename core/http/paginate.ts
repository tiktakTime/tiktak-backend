import { z } from "@hono/zod-openapi";
import type { ExpressionBuilder, SelectQueryBuilder } from "kysely";

import { app_config } from "@/app.config";

import { type PageResponse, toPage } from "./result";

export interface PaginationParams {
  page: number;
  limit: number;
}

/** Sayfa + limit (`app_config.pagination` default'ları). */
export const PaginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(app_config.pagination.default_page),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(app_config.pagination.max_limit)
    .default(app_config.pagination.default_limit),
});

/** Metin arama. */
export const SearchSchema = z.object({
  q: z.string().trim().min(1).optional(),
});

/** Humans sıralama: `sort` = kolon, `order` = ASC|DESC. */
export const SortOrderSchema = z.enum(["ASC", "DESC"]);

export const SortSchema = z.object({
  sort: z.string().trim().optional(),
  order: SortOrderSchema.optional(),
});

/** Humans `compactQuery`. */
export const CompactQuerySchema = z.object({
  compact: z.coerce.boolean().optional(),
  pure: z.coerce.boolean().optional(),
});

/** Ortak liste/arama sorgusu — parçalı şemaların birleşimi. */
export const PaginationQuerySchema = PaginationSchema.extend(SearchSchema.shape)
  .extend(SortSchema.shape)
  .extend(CompactQuerySchema.shape);

export type PaginateParams = PaginationParams & {
  /** Sıralama kolonu (starter: `orderBy`). */
  orderBy?: string;
  /** Yön (starter: `asc` | `desc`). */
  sort?: "asc" | "desc";
};

/**
 * Kysely select sorgusunu sayfalar.
 * Liste zarfı: `{ data, empty, pagination: { total, page } }`.
 */
export async function paginate<DB, TB extends keyof DB, O>(
  baseQuery: SelectQueryBuilder<DB, TB, O>,
  params: PaginateParams,
  sortExpressionMap?: Record<string, unknown> | unknown[],
): Promise<PageResponse<O>> {
  const countQuery = baseQuery
    .clearSelect()
    .clearOrderBy()
    .select((eb: ExpressionBuilder<DB, TB>) =>
      eb.fn.countAll().as("count"),
    ) as unknown as SelectQueryBuilder<
    DB,
    TB,
    { count: string | number | bigint }
  >;

  let dataQuery = baseQuery;
  if (params.orderBy && params.sort) {
    const orderExpr = (Array.isArray(sortExpressionMap)
      ? sortExpressionMap[0]
      : (sortExpressionMap?.[params.orderBy] ??
        params.orderBy)) as unknown as Parameters<typeof dataQuery.orderBy>[0];
    dataQuery = dataQuery.clearOrderBy().orderBy(orderExpr, params.sort);
  }

  const [countResult, data] = await Promise.all([
    countQuery.executeTakeFirstOrThrow(),
    dataQuery
      .limit(params.limit)
      .offset((params.page - 1) * params.limit)
      .execute(),
  ]);

  const total = Number(countResult.count);

  return toPage(data as O[], total, params.page);
}

/** Humans `sort` + `order` (ASC/DESC) → starter `orderBy` + `sort`. */
export function toPaginateSort(params: {
  sort?: string;
  order?: "ASC" | "DESC" | "asc" | "desc";
  orderBy?: string;
}): Pick<PaginateParams, "orderBy" | "sort"> {
  const orderBy = params.orderBy ?? params.sort;
  const raw = params.order;
  const sort =
    raw === undefined
      ? undefined
      : ((raw.toLowerCase() === "asc" ? "asc" : "desc") as "asc" | "desc");
  return {
    ...(orderBy ? { orderBy } : {}),
    ...(sort ? { sort } : {}),
  };
}
