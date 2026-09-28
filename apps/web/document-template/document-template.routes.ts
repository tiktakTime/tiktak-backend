import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.documentTemplatePending");

const post_organization_document_template = defineRoute({
  name: "web.post.organization.document-template",
  method: "post",
  path: "/organization/document-template",
  tag: "web.document-template",
  summary: "POST /organization/document-template",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_document_template_id = defineRoute({
  name: "web.delete.organization.document-template.id",
  method: "delete",
  path: "/organization/document-template/{id}",
  tag: "web.document-template",
  summary: "DELETE /organization/document-template/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_document_template_id = defineRoute({
  name: "web.get.organization.document-template.id",
  method: "get",
  path: "/organization/document-template/{id}",
  tag: "web.document-template",
  summary: "GET /organization/document-template/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_document_template_id = defineRoute({
  name: "web.patch.organization.document-template.id",
  method: "patch",
  path: "/organization/document-template/{id}",
  tag: "web.document-template",
  summary: "PATCH /organization/document-template/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_document_template_import_samples = defineRoute({
  name: "web.post.organization.document-template.import-samples",
  method: "post",
  path: "/organization/document-template/import-samples",
  tag: "web.document-template",
  summary: "POST /organization/document-template/import-samples",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_document_template_samples = defineRoute({
  name: "web.get.organization.document-template.samples",
  method: "get",
  path: "/organization/document-template/samples",
  tag: "web.document-template",
  summary: "GET /organization/document-template/samples",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_document_template_search = defineRoute({
  name: "web.get.organization.document-template.search",
  method: "get",
  path: "/organization/document-template/search",
  tag: "web.document-template",
  summary: "GET /organization/document-template/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webDocumentTemplateRouter = createSlice([
  post_organization_document_template,
  delete_organization_document_template_id,
  get_organization_document_template_id,
  patch_organization_document_template_id,
  post_organization_document_template_import_samples,
  get_organization_document_template_samples,
  get_organization_document_template_search,
]);
