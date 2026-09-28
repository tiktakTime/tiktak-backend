import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.rolePending");

const post_organization_role = defineRoute({
  name: "web.post.organization.role",
  method: "post",
  path: "/organization/role",
  tag: "web.role",
  summary: "POST /organization/role",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_role_id = defineRoute({
  name: "web.delete.organization.role.id",
  method: "delete",
  path: "/organization/role/{id}",
  tag: "web.role",
  summary: "DELETE /organization/role/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_role_id = defineRoute({
  name: "web.patch.organization.role.id",
  method: "patch",
  path: "/organization/role/{id}",
  tag: "web.role",
  summary: "PATCH /organization/role/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_role_search = defineRoute({
  name: "web.get.organization.role.search",
  method: "get",
  path: "/organization/role/search",
  tag: "web.role",
  summary: "GET /organization/role/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webRoleRouter = createSlice([
  post_organization_role,
  delete_organization_role_id,
  patch_organization_role_id,
  get_organization_role_search,
]);
