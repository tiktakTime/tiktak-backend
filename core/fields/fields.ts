import { z } from "@hono/zod-openapi";

/** Path/query `{ id: uuid }`. */
export const IdParamSchema = z.object({
  id: z.uuid(),
});

/** `YYYY-MM-DD` — nullable/optional alanlar için. */
export const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

/** ISO-8601 datetime — nullable/optional alanlar için. */
export const IsoInstantSchema = z.iso.datetime().nullable().optional();

/** Trim + lowercase; boş/null → null. */
export function normalizeEmail(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim().toLowerCase();
}
