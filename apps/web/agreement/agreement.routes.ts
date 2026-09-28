import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.agreementPending");

const post_organization_employee_agreement = defineRoute({
  name: "web.post.organization.employee.agreement",
  method: "post",
  path: "/organization/employee/agreement",
  tag: "web.agreement",
  summary: "POST /organization/employee/agreement",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_employee_agreement_id = defineRoute({
  name: "web.delete.organization.employee.agreement.id",
  method: "delete",
  path: "/organization/employee/agreement/{id}",
  tag: "web.agreement",
  summary: "DELETE /organization/employee/agreement/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_agreement_id = defineRoute({
  name: "web.get.organization.employee.agreement.id",
  method: "get",
  path: "/organization/employee/agreement/{id}",
  tag: "web.agreement",
  summary: "GET /organization/employee/agreement/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_employee_agreement_id = defineRoute({
  name: "web.patch.organization.employee.agreement.id",
  method: "patch",
  path: "/organization/employee/agreement/{id}",
  tag: "web.agreement",
  summary: "PATCH /organization/employee/agreement/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_agreement_active = defineRoute({
  name: "web.get.organization.employee.agreement.active",
  method: "get",
  path: "/organization/employee/agreement/active",
  tag: "web.agreement",
  summary: "GET /organization/employee/agreement/active",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_agreement_search = defineRoute({
  name: "web.get.organization.employee.agreement.search",
  method: "get",
  path: "/organization/employee/agreement/search",
  tag: "web.agreement",
  summary: "GET /organization/employee/agreement/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webAgreementRouter = createSlice([
  post_organization_employee_agreement,
  delete_organization_employee_agreement_id,
  get_organization_employee_agreement_id,
  patch_organization_employee_agreement_id,
  get_organization_employee_agreement_active,
  get_organization_employee_agreement_search,
]);
