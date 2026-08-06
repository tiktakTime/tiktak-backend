import { z } from "zod";

import { TTL } from "@tiktak/cache";
import { OrgIdParamsSchema, orgId, tags } from "@tiktak/core";

const MembershipIdParamsSchema = OrgIdParamsSchema.extend({
  membershipId: z.string(),
});

export const membersList = {
  path: orgId("/members"),
  method: "get" as const,
  summary: "List members",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  ttl: TTL.DEFAULT,
};

export const membersUpdate = {
  path: orgId("/members/{membershipId}"),
  method: "patch" as const,
  summary: "Update member role",
  tag: tags.organization,
  request: {
    params: MembershipIdParamsSchema,
  },
  invalidates: [membersList],
};

export const membersDeletee = {
  path: orgId("/members/{membershipId}"),
  method: "delete" as const,
  summary: "Remove member",
  tag: tags.organization,
  request: {
    params: MembershipIdParamsSchema,
  },
  invalidates: [membersList],
};

export const members = {
  list: membersList,
  update: membersUpdate,
  deletee: membersDeletee,
};
