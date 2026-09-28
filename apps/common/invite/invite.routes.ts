import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Common.invitePending");

const post_organization_invite = defineRoute({
  name: "common.post.organization.invite",
  method: "post",
  path: "/organization/invite",
  tag: "common.invite",
  summary: "POST /organization/invite",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_invite_id_resend = defineRoute({
  name: "common.post.organization.invite.id.resend",
  method: "post",
  path: "/organization/invite/{id}/resend",
  tag: "common.invite",
  summary: "POST /organization/invite/{id}/resend",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_invite_search = defineRoute({
  name: "common.get.organization.invite.search",
  method: "get",
  path: "/organization/invite/search",
  tag: "common.invite",
  summary: "GET /organization/invite/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_invite_id_cancel = defineRoute({
  name: "common.patch.organization.invite.id.cancel",
  method: "patch",
  path: "/organization/invite/{id}/cancel",
  tag: "common.invite",
  summary: "PATCH /organization/invite/{id}/cancel",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const commonInviteRouter = createSlice([
  post_organization_invite,
  post_organization_invite_id_resend,
  get_organization_invite_search,
  patch_organization_invite_id_cancel,
]);
