import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.emailTemplatePending");

const post_organization_email_template = defineRoute({
  name: "web.post.organization.email-template",
  method: "post",
  path: "/organization/email-template",
  tag: "web.email-template",
  summary: "POST /organization/email-template",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_email_template_id = defineRoute({
  name: "web.delete.organization.email-template.id",
  method: "delete",
  path: "/organization/email-template/{id}",
  tag: "web.email-template",
  summary: "DELETE /organization/email-template/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_email_template_id = defineRoute({
  name: "web.get.organization.email-template.id",
  method: "get",
  path: "/organization/email-template/{id}",
  tag: "web.email-template",
  summary: "GET /organization/email-template/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_email_template_id = defineRoute({
  name: "web.patch.organization.email-template.id",
  method: "patch",
  path: "/organization/email-template/{id}",
  tag: "web.email-template",
  summary: "PATCH /organization/email-template/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_email_template_search = defineRoute({
  name: "web.get.organization.email-template.search",
  method: "get",
  path: "/organization/email-template/search",
  tag: "web.email-template",
  summary: "GET /organization/email-template/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webEmailTemplateRouter = createSlice([
  post_organization_email_template,
  delete_organization_email_template_id,
  get_organization_email_template_id,
  patch_organization_email_template_id,
  get_organization_email_template_search,
]);
