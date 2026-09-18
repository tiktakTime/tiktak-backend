import { z } from "@hono/zod-openapi";

import { InviteStatus } from "@/modules/db";

const InviteStatusSchema = z.enum([
  InviteStatus.pending,
  InviteStatus.accepted,
  InviteStatus.expired,
  InviteStatus.canceled,
]);

export const InviteByTokenQuerySchema = z
  .object({ token: z.string().min(10).max(128) })
  .openapi("InviteByTokenQuery");

export const InviteAcceptBodySchema = z
  .object({
    token: z.string().min(10).max(128),
    password: z.string().min(8).max(255).optional(),
  })
  .openapi("InviteAcceptBody");

export const InviteByTokenPayloadSchema = z
  .object({
    invite: z.object({
      status: InviteStatusSchema,
      email: z.string(),
      description: z.string().nullable(),
      expires_at: z.coerce.date(),
      accepted_at: z.coerce.date().nullable(),
    }),
    organization: z.object({
      id: z.uuid(),
      company_name: z.string(),
    }),
    person: z.object({
      first_name: z.string(),
      last_name: z.string(),
    }),
    scenario: z.enum(["existing", "new"]),
    can_accept: z.boolean(),
    reason: z.string().nullable(),
  })
  .openapi("InviteByTokenPayload");
