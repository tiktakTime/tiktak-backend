import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileDocumentPending");

const get_organization_employee_document_me = defineRoute({
  name: "mobile.get.organization.employee.document.me",
  method: "get",
  path: "/organization/employee/document/me",
  tag: "mobile.document",
  summary: "GET /organization/employee/document/me",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_document_me_id = defineRoute({
  name: "mobile.get.organization.employee.document.me.id",
  method: "get",
  path: "/organization/employee/document/me/{id}",
  tag: "mobile.document",
  summary: "GET /organization/employee/document/me/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_me_id_sign = defineRoute({
  name: "mobile.post.organization.employee.document.me.id.sign",
  method: "post",
  path: "/organization/employee/document/me/{id}/sign",
  tag: "mobile.document",
  summary: "POST /organization/employee/document/me/{id}/sign",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_document_me_id_acknowledge = defineRoute({
  name: "mobile.post.organization.employee.document.me.id.acknowledge",
  method: "post",
  path: "/organization/employee/document/me/{id}/acknowledge",
  tag: "mobile.document",
  summary: "POST /organization/employee/document/me/{id}/acknowledge",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileDocumentRouter = createSlice([
  get_organization_employee_document_me_id,
  post_organization_employee_document_me_id_sign,
  post_organization_employee_document_me_id_acknowledge,
  get_organization_employee_document_me,
]);
