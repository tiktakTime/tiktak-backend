import { z } from "@hono/zod-openapi";

import { PaginationQuerySchema } from "@/core/http";
import { InviteStatus } from "@/modules/db";

const InviteStatusSchema = z.enum([
  InviteStatus.pending,
  InviteStatus.accepted,
  InviteStatus.expired,
  InviteStatus.canceled,
]);

export const InviteSchema = z
  .object({
    id: z.uuid(),
    organization_id: z.uuid(),
    user_id: z.uuid().nullable(),
    person_id: z.uuid(),
    email: z.string(),
    status: InviteStatusSchema,
    description: z.string().nullable(),
    expires_at: z.coerce.date(),
    accepted_at: z.coerce.date().nullable(),
    canceled_at: z.coerce.date().nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
  })
  .openapi("Invite");

export const InviteCreateSchema = z
  .object({
    person_id: z.uuid(),
    description: z.string().max(2000).nullable().optional(),
    expires_at: z.coerce.date().optional(),
  })
  .openapi("InviteCreate");

export const InviteIdParamSchema = z.object({ id: z.uuid() });

export const InviteSearchQuerySchema = PaginationQuerySchema.extend({
  status: InviteStatusSchema.optional(),
});
