import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.modulePending");

const post_organization_form_module = defineRoute({
  name: "web.post.organization.form.module",
  method: "post",
  path: "/organization/form/module",
  tag: "web.module",
  summary: "POST /organization/form/module",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_form_module_id = defineRoute({
  name: "web.delete.organization.form.module.id",
  method: "delete",
  path: "/organization/form/module/{id}",
  tag: "web.module",
  summary: "DELETE /organization/form/module/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_form_module_id = defineRoute({
  name: "web.get.organization.form.module.id",
  method: "get",
  path: "/organization/form/module/{id}",
  tag: "web.module",
  summary: "GET /organization/form/module/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_form_module_id = defineRoute({
  name: "web.patch.organization.form.module.id",
  method: "patch",
  path: "/organization/form/module/{id}",
  tag: "web.module",
  summary: "PATCH /organization/form/module/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_form_module_id_usage = defineRoute({
  name: "web.get.organization.form.module.id.usage",
  method: "get",
  path: "/organization/form/module/{id}/usage",
  tag: "web.module",
  summary: "GET /organization/form/module/{id}/usage",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_form_module_search = defineRoute({
  name: "web.get.organization.form.module.search",
  method: "get",
  path: "/organization/form/module/search",
  tag: "web.module",
  summary: "GET /organization/form/module/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webModuleRouter = createSlice([
  post_organization_form_module,
  delete_organization_form_module_id,
  get_organization_form_module_id,
  patch_organization_form_module_id,
  get_organization_form_module_id_usage,
  get_organization_form_module_search,
]);
