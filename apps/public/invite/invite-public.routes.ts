import { z } from "@hono/zod-openapi";

import { Result, createSlice, defineRoute } from "@/core/http";

import { acceptInvite, getInviteByToken } from "./domain";
import {
  InviteAcceptBodySchema,
  InviteByTokenPayloadSchema,
  InviteByTokenQuerySchema,
} from "./invite.schema";

const TAG = "invite-public";

const AcceptResultSchema = z
  .object({
    organization_id: z.uuid(),
    user_id: z.uuid(),
  })
  .openapi("InviteAccept");

const byToken = defineRoute({
  name: "invite.by-token",
  method: "get",
  path: "/invite/by-token",
  tag: TAG,
  summary: "Get invite by public token",
  request: { query: InviteByTokenQuerySchema },
  response: Result(InviteByTokenPayloadSchema, "Invite payload"),
  security: "none",
  tenant: "none",
  handle: ({ query }) => getInviteByToken(query.token),
});

const accept = defineRoute({
  name: "invite.accept",
  method: "post",
  path: "/invite/accept",
  tag: TAG,
  summary: "Accept organization invite",
  request: { body: InviteAcceptBodySchema },
  response: Result(AcceptResultSchema, "Accepted"),
  security: "none",
  tenant: "none",
  handle: async ({ body }) => {
    const data = await acceptInvite({
      token: body.token,
      password: body.password,
    });
    return {
      organization_id: data.organization_id,
      user_id: data.user_id,
    };
  },
});

export const invitePublicRouter = createSlice([byToken, accept]);
