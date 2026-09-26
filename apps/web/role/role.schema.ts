import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import { IdParamSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";
import { type Role as RoleRow } from "@/modules/db";

type RolePublic = Pick<
  Selectable<RoleRow>,
  | "id"
  | "organization_id"
  | "slug"
  | "name"
  | "description"
  | "is_locked"
  | "created_at"
  | "updated_at"
>;

export const RoleSchema = z
  .toZod<RolePublic>()(
    z.object({
      id: z.uuid(),
      organization_id: z.uuid().nullable(),
      slug: z.string().nullable(),
      name: z.string(),
      description: z.string().nullable(),
      is_locked: z.boolean(),
      created_at: z.date(),
      updated_at: z.date(),
    }),
  )
  .openapi("Role");

export const RoleCreateSchema = z
  .object({
    organization_id: z.uuid(),
    slug: z.string().optional(),
    name: z.string().trim().min(1).max(255),
    description: z.string().max(500).optional(),
    is_locked: z.boolean().optional(),
    permissions: z.array(z.uuid()).optional(),
  })
  .openapi("RoleCreate");

export const RoleUpdateSchema = z
  .object({
    slug: z.string().optional(),
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().max(500).optional(),
    is_locked: z.boolean().optional(),
    permissions: z.array(z.uuid()).optional(),
  })
  .openapi("RoleUpdate");

export const RoleSearchQuerySchema = PaginationQuerySchema.extend({
  organization_id: z.uuid().optional(),
});

export const RoleIdParamSchema = IdParamSchema;

export type Role = z.infer<typeof RoleSchema>;
export type RoleCreate = z.infer<typeof RoleCreateSchema>;
export type RoleUpdate = z.infer<typeof RoleUpdateSchema>;
export type RoleSearchQuery = z.infer<typeof RoleSearchQuerySchema>;
