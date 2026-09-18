import { z } from "@hono/zod-openapi";

import { IdParamSchema, IsoInstantSchema } from "@/core/fields";
import { PaginationQuerySchema } from "@/core/http";

const AccessStatusSchema = z.enum([
  "pending",
  "active",
  "inactive",
  "blocked",
  "canceled",
]);

export const AccessSchema = z
  .object({
    id: z.uuid(),
    organization_id: z.uuid(),
    user_id: z.uuid().nullable(),
    person_id: z.uuid().nullable(),
    role_id: z.uuid().nullable(),
    status: AccessStatusSchema,
    expired_date: z.date().nullable(),
    description: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .openapi("Access");

export const AccessCreateSchema = z
  .object({
    organization_id: z.uuid(),
    user_id: z.uuid(),
    person_id: z.uuid().optional(),
    status: AccessStatusSchema.optional(),
    description: z.string().nullable().optional(),
    expired_date: IsoInstantSchema,
  })
  .openapi("AccessCreate");

export const AccessUpdateSchema = z
  .object({
    user_id: z.uuid().optional(),
    person_id: z.uuid().optional(),
    status: AccessStatusSchema.optional(),
    description: z.string().nullable().optional(),
    expired_date: IsoInstantSchema,
  })
  .openapi("AccessUpdate");

export const AccessSearchQuerySchema = PaginationQuerySchema.extend({
  organization_id: z.uuid().optional(),
  status: AccessStatusSchema.optional(),
});

export const AccessIdParamSchema = IdParamSchema;

export type Access = z.infer<typeof AccessSchema>;
export type AccessCreate = z.infer<typeof AccessCreateSchema>;
export type AccessUpdate = z.infer<typeof AccessUpdateSchema>;
export type AccessSearchQuery = z.infer<typeof AccessSearchQuerySchema>;
