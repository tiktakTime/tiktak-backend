import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Admin.superadminInvitePending");

const post_superadmin_invite = defineRoute({
  name: "admin.post.superadmin.invite",
  method: "post",
  path: "/superadmin/invite",
  tag: "admin.superadmin-invite",
  summary: "POST /superadmin/invite",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_invite_id_cancel = defineRoute({
  name: "admin.patch.superadmin.invite.id.cancel",
  method: "patch",
  path: "/superadmin/invite/{id}/cancel",
  tag: "admin.superadmin-invite",
  summary: "PATCH /superadmin/invite/{id}/cancel",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_superadmin_invite_id_resend = defineRoute({
  name: "admin.post.superadmin.invite.id.resend",
  method: "post",
  path: "/superadmin/invite/{id}/resend",
  tag: "admin.superadmin-invite",
  summary: "POST /superadmin/invite/{id}/resend",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const adminSuperadminInviteRouter = createSlice([
  post_superadmin_invite,
  patch_superadmin_invite_id_cancel,
  post_superadmin_invite_id_resend,
]);
