import { z } from "@hono/zod-openapi";
import type { Selectable } from "kysely";

import {
  type Invite,
  InviteStatus,
  type Organization,
  type Person,
} from "@/modules/db";

const InviteStatusSchema = z.enum(InviteStatus);

export const InviteByTokenQuerySchema = z
  .object({ token: z.string().min(10).max(128) })
  .openapi("InviteByTokenQuery");

export const InviteAcceptBodySchema = z
  .object({
    token: z.string().min(10).max(128),
    password: z.string().min(8).max(255).optional(),
  })
  .openapi("InviteAcceptBody");

type InviteByTokenPayload = {
  invite: Pick<
    Selectable<Invite>,
    "status" | "email" | "description" | "expires_at" | "accepted_at"
  >;
  organization: Pick<Selectable<Organization>, "id" | "company_name">;
  person: Pick<Selectable<Person>, "first_name" | "last_name">;
  scenario: "existing" | "new";
  can_accept: boolean;
  reason: string | null;
};

export const InviteByTokenPayloadSchema = z
  .toZod<InviteByTokenPayload>()(
    z.object({
      invite: z.object({
        status: InviteStatusSchema,
        email: z.string(),
        description: z.string().nullable(),
        expires_at: z.coerce.date(),
        accepted_at: z.coerce.date().nullable(),
      }),
      organization: z.object({
        id: z.uuid(),
        company_name: z.string().nullable(),
      }),
      person: z.object({
        first_name: z.string(),
        last_name: z.string(),
      }),
      scenario: z.enum(["existing", "new"]),
      can_accept: z.boolean(),
      reason: z.string().nullable(),
    }),
  )
  .openapi("InviteByTokenPayload");
