import { z } from "zod";

import { TTL } from "@tiktak/cache";
import { tags } from "@tiktak/core";

import { ListPendingInvitationsQuerySchema } from "../organization/core/core.types";

export const get = {
  path: "/user",
  method: "get" as const,
  summary: "Get user profile",
  tag: tags.user,
  prefix: (c: any) => "user:" + c.get("user").id,
  ttl: TTL.LONG,
};

export const update = {
  path: "/user",
  method: "patch" as const,
  summary: "Update user profile",
  tag: tags.user,
  prefix: (c: any) => "user:" + c.get("user").id,
  invalidates: [get],
};

export const invitations = {
  path: "/user/invitations",
  method: "get" as const,
  summary: "List pending invitations",
  tag: tags.user,
  request: {
    query: ListPendingInvitationsQuerySchema,
  },
  prefix: (c: any) => "user:" + c.get("user").id,
  ttl: TTL.DEFAULT,
};

export const acceptInvitation = {
  path: "/invitations/{invitationId}",
  method: "post" as const,
  summary: "Accept invitation",
  tag: tags.user,
  request: {
    params: z.object({
      invitationId: z.string(),
    }),
  },
  invalidates: [invitations],
};

export const userContracts = {
  get,
  update,
  invitations,
  acceptInvitation,
};
