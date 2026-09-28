import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Admin.superadminUserPending");

const post_superadmin_user = defineRoute({
  name: "admin.post.superadmin.user",
  method: "post",
  path: "/superadmin/user",
  tag: "admin.superadmin-user",
  summary: "POST /superadmin/user",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_superadmin_user_id = defineRoute({
  name: "admin.delete.superadmin.user.id",
  method: "delete",
  path: "/superadmin/user/{id}",
  tag: "admin.superadmin-user",
  summary: "DELETE /superadmin/user/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_user_id = defineRoute({
  name: "admin.get.superadmin.user.id",
  method: "get",
  path: "/superadmin/user/{id}",
  tag: "admin.superadmin-user",
  summary: "GET /superadmin/user/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_user_id = defineRoute({
  name: "admin.patch.superadmin.user.id",
  method: "patch",
  path: "/superadmin/user/{id}",
  tag: "admin.superadmin-user",
  summary: "PATCH /superadmin/user/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_superadmin_user_id_grant_super_admin = defineRoute({
  name: "admin.post.superadmin.user.id.grant-super-admin",
  method: "post",
  path: "/superadmin/user/{id}/grant-super-admin",
  tag: "admin.superadmin-user",
  summary: "POST /superadmin/user/{id}/grant-super-admin",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_user_id_restore = defineRoute({
  name: "admin.patch.superadmin.user.id.restore",
  method: "patch",
  path: "/superadmin/user/{id}/restore",
  tag: "admin.superadmin-user",
  summary: "PATCH /superadmin/user/{id}/restore",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_superadmin_user_id_revoke_sessions = defineRoute({
  name: "admin.post.superadmin.user.id.revoke-sessions",
  method: "post",
  path: "/superadmin/user/{id}/revoke-sessions",
  tag: "admin.superadmin-user",
  summary: "POST /superadmin/user/{id}/revoke-sessions",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_superadmin_user_id_revoke_super_admin = defineRoute({
  name: "admin.post.superadmin.user.id.revoke-super-admin",
  method: "post",
  path: "/superadmin/user/{id}/revoke-super-admin",
  tag: "admin.superadmin-user",
  summary: "POST /superadmin/user/{id}/revoke-super-admin",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_superadmin_user_id_send_set_password = defineRoute({
  name: "admin.post.superadmin.user.id.send-set-password",
  method: "post",
  path: "/superadmin/user/{id}/send-set-password",
  tag: "admin.superadmin-user",
  summary: "POST /superadmin/user/{id}/send-set-password",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_user_search = defineRoute({
  name: "admin.get.superadmin.user.search",
  method: "get",
  path: "/superadmin/user/search",
  tag: "admin.superadmin-user",
  summary: "GET /superadmin/user/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const adminSuperadminUserRouter = createSlice([
  post_superadmin_user,
  delete_superadmin_user_id,
  get_superadmin_user_id,
  patch_superadmin_user_id,
  post_superadmin_user_id_grant_super_admin,
  patch_superadmin_user_id_restore,
  post_superadmin_user_id_revoke_sessions,
  post_superadmin_user_id_revoke_super_admin,
  post_superadmin_user_id_send_set_password,
  get_superadmin_user_search,
]);
