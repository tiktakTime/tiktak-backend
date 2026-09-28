import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.absencePending");

const post_organization_employee_absence = defineRoute({
  name: "web.post.organization.employee.absence",
  method: "post",
  path: "/organization/employee/absence",
  tag: "web.absence",
  summary: "POST /organization/employee/absence",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_employee_absence_id = defineRoute({
  name: "web.delete.organization.employee.absence.id",
  method: "delete",
  path: "/organization/employee/absence/{id}",
  tag: "web.absence",
  summary: "DELETE /organization/employee/absence/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_employee_absence_id = defineRoute({
  name: "web.patch.organization.employee.absence.id",
  method: "patch",
  path: "/organization/employee/absence/{id}",
  tag: "web.absence",
  summary: "PATCH /organization/employee/absence/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_absence_search = defineRoute({
  name: "web.get.organization.employee.absence.search",
  method: "get",
  path: "/organization/employee/absence/search",
  tag: "web.absence",
  summary: "GET /organization/employee/absence/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webAbsenceRouter = createSlice([
  post_organization_employee_absence,
  delete_organization_employee_absence_id,
  patch_organization_employee_absence_id,
  get_organization_employee_absence_search,
]);
