import type { ExpressionBuilder, SelectQueryBuilder } from "kysely";

import { type PaginationParams } from "./route-helpers/validation";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  nextPage: number | null;
}

export async function paginate<DB, TB extends keyof DB, O>(
  baseQuery: SelectQueryBuilder<DB, TB, O>,
  params: PaginationParams & { orderBy?: string; sort?: "asc" | "desc" },
  sortExpressionMap?: Record<string, unknown> | unknown[],
): Promise<PaginatedResult<O>> {
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
      : sortExpressionMap?.[params.orderBy] ?? params.orderBy) as unknown as Parameters<typeof dataQuery.orderBy>[0];
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
  const nextPage = total > params.page * params.limit ? params.page + 1 : null;

  return {
    data: data as O[],
    total,
    nextPage,
  };
}
