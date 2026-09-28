import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.documentPending");

const post_organization_employee_document = defineRoute({
  name: "web.post.organization.employee.document",
  method: "post",
  path: "/organization/employee/document",
  tag: "web.document",
  summary: "POST /organization/employee/document",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_employee_document_id = defineRoute({
  name: "web.delete.organization.employee.document.id",
  method: "delete",
  path: "/organization/employee/document/{id}",
  tag: "web.document",
  summary: "DELETE /organization/employee/document/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_document_id = defineRoute({
  name: "web.get.organization.employee.document.id",
  method: "get",
  path: "/organization/employee/document/{id}",
  tag: "web.document",
  summary: "GET /organization/employee/document/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_employee_document_id = defineRoute({
  name: "web.patch.organization.employee.document.id",
  method: "patch",
  path: "/organization/employee/document/{id}",
  tag: "web.document",
  summary: "PATCH /organization/employee/document/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_id_deliver = defineRoute({
  name: "web.post.organization.employee.document.id.deliver",
  method: "post",
  path: "/organization/employee/document/{id}/deliver",
  tag: "web.document",
  summary: "POST /organization/employee/document/{id}/deliver",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_id_file = defineRoute({
  name: "web.post.organization.employee.document.id.file",
  method: "post",
  path: "/organization/employee/document/{id}/file",
  tag: "web.document",
  summary: "POST /organization/employee/document/{id}/file",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_id_issue = defineRoute({
  name: "web.post.organization.employee.document.id.issue",
  method: "post",
  path: "/organization/employee/document/{id}/issue",
  tag: "web.document",
  summary: "POST /organization/employee/document/{id}/issue",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_id_revert = defineRoute({
  name: "web.post.organization.employee.document.id.revert",
  method: "post",
  path: "/organization/employee/document/{id}/revert",
  tag: "web.document",
  summary: "POST /organization/employee/document/{id}/revert",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_id_send_email = defineRoute({
  name: "web.post.organization.employee.document.id.send-email",
  method: "post",
  path: "/organization/employee/document/{id}/send-email",
  tag: "web.document",
  summary: "POST /organization/employee/document/{id}/send-email",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_id_sign = defineRoute({
  name: "web.post.organization.employee.document.id.sign",
  method: "post",
  path: "/organization/employee/document/{id}/sign",
  tag: "web.document",
  summary: "POST /organization/employee/document/{id}/sign",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_id_void = defineRoute({
  name: "web.post.organization.employee.document.id.void",
  method: "post",
  path: "/organization/employee/document/{id}/void",
  tag: "web.document",
  summary: "POST /organization/employee/document/{id}/void",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_document_search = defineRoute({
  name: "web.get.organization.employee.document.search",
  method: "get",
  path: "/organization/employee/document/search",
  tag: "web.document",
  summary: "GET /organization/employee/document/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_document_types = defineRoute({
  name: "web.get.organization.employee.document.types",
  method: "get",
  path: "/organization/employee/document/types",
  tag: "web.document",
  summary: "GET /organization/employee/document/types",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webDocumentRouter = createSlice([
  post_organization_employee_document,
  delete_organization_employee_document_id,
  get_organization_employee_document_id,
  patch_organization_employee_document_id,
  post_organization_employee_document_id_deliver,
  post_organization_employee_document_id_file,
  post_organization_employee_document_id_issue,
  post_organization_employee_document_id_revert,
  post_organization_employee_document_id_send_email,
  post_organization_employee_document_id_sign,
  post_organization_employee_document_id_void,
  get_organization_employee_document_search,
  get_organization_employee_document_types,
]);
