import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.organizationPending");

const post_organization = defineRoute({
  name: "web.post.organization",
  method: "post",
  path: "/organization",
  tag: "web.organization",
  summary: "POST /organization",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_id = defineRoute({
  name: "web.get.organization.id",
  method: "get",
  path: "/organization/{id}",
  tag: "web.organization",
  summary: "GET /organization/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_id = defineRoute({
  name: "web.patch.organization.id",
  method: "patch",
  path: "/organization/{id}",
  tag: "web.organization",
  summary: "PATCH /organization/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webOrganizationRouter = createSlice([
  post_organization,
  get_organization_id,
  patch_organization_id,
]);
