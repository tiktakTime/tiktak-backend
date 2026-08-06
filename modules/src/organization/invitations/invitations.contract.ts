import { z } from "zod";

import { TTL } from "@tiktak/cache";
import { OrgIdParamsSchema, orgId, tags } from "@tiktak/core";

const InvitationIdParamsSchema = OrgIdParamsSchema.extend({
  invitationId: z.string(),
});

export const invitationsList = {
  path: orgId("/invitations"),
  method: "get" as const,
  summary: "List pending invitations",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  ttl: TTL.DEFAULT,
};

export const invitationsCreate = {
  path: orgId("/invitations"),
  method: "post" as const,
  summary: "Invite member",
  tag: tags.organization,
  request: {
    params: OrgIdParamsSchema,
  },
  invalidates: [invitationsList],
};

export const invitationsUpdate = {
  path: orgId("/invitations/{invitationId}"),
  method: "patch" as const,
  summary: "Resend invitation",
  tag: tags.organization,
  request: {
    params: InvitationIdParamsSchema,
  },
  invalidates: [invitationsList],
};

export const invitationsDeletee = {
  path: orgId("/invitations/{invitationId}"),
  method: "delete" as const,
  summary: "Revoke invitation",
  tag: tags.organization,
  request: {
    params: InvitationIdParamsSchema,
  },
  invalidates: [invitationsList],
};

export const invitations = {
  list: invitationsList,
  create: invitationsCreate,
  update: invitationsUpdate,
  deletee: invitationsDeletee,
};
