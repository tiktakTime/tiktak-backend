import { TTL } from "@/core/cache";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  cancelInvite,
  createInvite,
  getInvite,
  resendInvite,
  searchInvites,
} from "./domain";
import {
  InviteCreateSchema,
  InviteIdParamSchema,
  InviteSchema,
  InviteSearchQuerySchema,
} from "./invite.schema";

const TAG = "invite";
const BASE = "/organization/invite";

const search = defineRoute({
  name: "invite.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search organization invites",
  request: { query: InviteSearchQuerySchema },
  response: Page(InviteSchema, "Invite list"),
  tenant: "org",
  policy: ["invite.get"],
  cache: { read: { ttl: TTL.DEFAULT, tags: ["invite"] } },
  handle: ({ tenantId, query }) => searchInvites(tenantId, query),
});

const get = defineRoute({
  name: "invite.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get invite by id",
  request: { params: InviteIdParamSchema },
  response: Result(InviteSchema, "Invite"),
  tenant: "org",
  policy: ["invite.get"],
  cache: { read: { ttl: TTL.LONG, tags: ["invite"] } },
  handle: ({ tenantId, params }) => getInvite(tenantId, params.id),
});

const create = defineRoute({
  name: "invite.create",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create organization invite",
  request: { body: InviteCreateSchema },
  response: Result(InviteSchema, "Created"),
  tenant: "org",
  policy: ["invite.post"],
  cache: { write: { purge: ["invite"] } },
  handle: ({ tenantId, body, c }) =>
    createInvite({
      organizationId: tenantId,
      actorUserId: c.get("user_id")!,
      personId: body.person_id,
      description: body.description,
      expiresAt: body.expires_at,
    }),
});

const resend = defineRoute({
  name: "invite.resend",
  method: "post",
  path: `${BASE}/{id}/resend`,
  tag: TAG,
  summary: "Resend pending invite",
  request: { params: InviteIdParamSchema },
  response: Result(InviteSchema, "Resent"),
  tenant: "org",
  policy: ["invite.post"],
  cache: { write: { purge: ["invite"] } },
  handle: ({ tenantId, params, c }) =>
    resendInvite({
      organizationId: tenantId,
      actorUserId: c.get("user_id")!,
      inviteId: params.id,
    }),
});

const cancel = defineRoute({
  name: "invite.cancel",
  method: "post",
  path: `${BASE}/{id}/cancel`,
  tag: TAG,
  summary: "Cancel pending invite",
  request: { params: InviteIdParamSchema },
  response: Result(InviteSchema, "Canceled"),
  tenant: "org",
  policy: ["invite.patch"],
  cache: { write: { purge: ["invite"] } },
  handle: ({ tenantId, params, c }) =>
    cancelInvite({
      organizationId: tenantId,
      actorUserId: c.get("user_id")!,
      inviteId: params.id,
    }),
});

export const inviteRouter = createSlice([search, get, create, resend, cancel]);
