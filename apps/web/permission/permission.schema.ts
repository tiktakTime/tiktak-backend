import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import { IdParamSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";
import { type Permission as PermissionRow } from "@/modules/db";

type PermissionPublic = Pick<
  Selectable<PermissionRow>,
  | "id"
  | "organization_id"
  | "slug"
  | "name"
  | "description"
  | "is_locked"
  | "created_at"
  | "updated_at"
>;

export const PermissionSchema = z
  .toZod<PermissionPublic>()(
    z.object({
      id: z.uuid(),
      organization_id: z.uuid().nullable(),
      slug: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      is_locked: z.boolean(),
      created_at: z.date(),
      updated_at: z.date(),
    }),
  )
  .openapi("Permission");

export const PermissionCreateSchema = z
  .object({
    organization_id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    is_locked: z.boolean().optional(),
  })
  .openapi("PermissionCreate");

export const PermissionUpdateSchema = z
  .object({
    slug: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    is_locked: z.boolean().optional(),
  })
  .openapi("PermissionUpdate");

export const PermissionSearchQuerySchema = PaginationQuerySchema.extend({
  organization_id: z.uuid().optional(),
});

export const PermissionIdParamSchema = IdParamSchema;

export type Permission = z.infer<typeof PermissionSchema>;
export type PermissionCreate = z.infer<typeof PermissionCreateSchema>;
export type PermissionUpdate = z.infer<typeof PermissionUpdateSchema>;
export type PermissionSearchQuery = z.infer<typeof PermissionSearchQuerySchema>;
