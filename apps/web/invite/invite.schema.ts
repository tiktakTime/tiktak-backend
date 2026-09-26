import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import { PaginationQuerySchema } from "@/core/http";
import { type Invite, InviteStatus } from "@/modules/db";

const InviteStatusSchema = z.enum(InviteStatus);

/** Token ve deneme sayaçları telde yok. */
type InvitePublic = Pick<
  Selectable<Invite>,
  | "id"
  | "organization_id"
  | "user_id"
  | "person_id"
  | "email"
  | "status"
  | "description"
  | "expires_at"
  | "accepted_at"
  | "canceled_at"
  | "created_at"
  | "updated_at"
>;

export const InviteSchema = z
  .toZod<InvitePublic>()(
    z.object({
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
    }),
  )
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
