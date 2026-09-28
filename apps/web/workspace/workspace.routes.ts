import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.workspacePending");

const post_organization_workspace = defineRoute({
  name: "web.post.organization.workspace",
  method: "post",
  path: "/organization/workspace",
  tag: "web.workspace",
  summary: "POST /organization/workspace",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_workspace_id = defineRoute({
  name: "web.delete.organization.workspace.id",
  method: "delete",
  path: "/organization/workspace/{id}",
  tag: "web.workspace",
  summary: "DELETE /organization/workspace/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_workspace_id = defineRoute({
  name: "web.get.organization.workspace.id",
  method: "get",
  path: "/organization/workspace/{id}",
  tag: "web.workspace",
  summary: "GET /organization/workspace/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_workspace_id = defineRoute({
  name: "web.patch.organization.workspace.id",
  method: "patch",
  path: "/organization/workspace/{id}",
  tag: "web.workspace",
  summary: "PATCH /organization/workspace/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_workspace_search = defineRoute({
  name: "web.get.organization.workspace.search",
  method: "get",
  path: "/organization/workspace/search",
  tag: "web.workspace",
  summary: "GET /organization/workspace/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webWorkspaceRouter = createSlice([
  post_organization_workspace,
  delete_organization_workspace_id,
  get_organization_workspace_id,
  patch_organization_workspace_id,
  get_organization_workspace_search,
]);
