import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.attributePending");

const post_organization_form_attribute = defineRoute({
  name: "web.post.organization.form.attribute",
  method: "post",
  path: "/organization/form/attribute",
  tag: "web.attribute",
  summary: "POST /organization/form/attribute",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_form_attribute_id = defineRoute({
  name: "web.delete.organization.form.attribute.id",
  method: "delete",
  path: "/organization/form/attribute/{id}",
  tag: "web.attribute",
  summary: "DELETE /organization/form/attribute/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_form_attribute_id = defineRoute({
  name: "web.patch.organization.form.attribute.id",
  method: "patch",
  path: "/organization/form/attribute/{id}",
  tag: "web.attribute",
  summary: "PATCH /organization/form/attribute/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_form_attribute_id_usage = defineRoute({
  name: "web.get.organization.form.attribute.id.usage",
  method: "get",
  path: "/organization/form/attribute/{id}/usage",
  tag: "web.attribute",
  summary: "GET /organization/form/attribute/{id}/usage",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_form_attribute_search = defineRoute({
  name: "web.get.organization.form.attribute.search",
  method: "get",
  path: "/organization/form/attribute/search",
  tag: "web.attribute",
  summary: "GET /organization/form/attribute/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webAttributeRouter = createSlice([
  post_organization_form_attribute,
  delete_organization_form_attribute_id,
  patch_organization_form_attribute_id,
  get_organization_form_attribute_id_usage,
  get_organization_form_attribute_search,
]);
