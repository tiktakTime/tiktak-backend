import { z } from "zod";

export function createPaginatedResponseSchema<T extends z.ZodType>(
  itemSchema: T,
) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    nextPage: z.number().int().positive().nullable(),
  });
}

export const SlugParamsSchema = z.object({
  slug: z.string(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

export const SearchSchema = z.object({
  q: z.string().optional(),
});

export const IdParamsSchema = z.object({
  id: z.string(),
});

export const OrgIdParamsSchema = z.object({
  orgId: z.string(),
});

export const DeleteResponseSchema = z.object({
  id: z.string(),
  status: z.literal("deleted"),
});

export const SortOrderSchema = z.object({
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export const SortSchema = z.object({
  sort: z.enum(["asc", "desc"]).optional(),
  orderBy: z.string().optional(),
});
