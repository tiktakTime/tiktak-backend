import { ExpressionBuilder, StringReference } from "kysely";

/**
 * Creates accent-insensitive (unaccent) ILIKE comparison expressions combined with OR.
 * E.g., unaccent(col1) ILIKE unaccent('%value%') OR unaccent(col2) ILIKE unaccent('%value%')
 */
export function unaccentIlike<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  columns: StringReference<DB, TB> | StringReference<DB, TB>[],
  value: string,
) {
  const searchVal =
    value.startsWith("%") || value.endsWith("%") ? value : `%${value}%`;

  const colArray = Array.isArray(columns) ? columns : [columns];

  return eb.or(
    colArray.map((col) =>
      eb(
        eb.fn("unaccent", [eb.ref(col)]),
        "ilike",
        eb.fn("unaccent", [eb.val(searchVal)]),
      ),
    ),
  );
}
