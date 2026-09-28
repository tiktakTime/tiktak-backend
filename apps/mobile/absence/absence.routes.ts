import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileAbsencePending");

const post_organization_employee_absence = defineRoute({
  name: "mobile.post.organization.employee.absence",
  method: "post",
  path: "/organization/employee/absence",
  tag: "mobile.absence",
  summary: "POST /organization/employee/absence",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_employee_absence_id = defineRoute({
  name: "mobile.delete.organization.employee.absence.id",
  method: "delete",
  path: "/organization/employee/absence/{id}",
  tag: "mobile.absence",
  summary: "DELETE /organization/employee/absence/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_absence_id = defineRoute({
  name: "mobile.get.organization.employee.absence.id",
  method: "get",
  path: "/organization/employee/absence/{id}",
  tag: "mobile.absence",
  summary: "GET /organization/employee/absence/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_employee_absence_id = defineRoute({
  name: "mobile.patch.organization.employee.absence.id",
  method: "patch",
  path: "/organization/employee/absence/{id}",
  tag: "mobile.absence",
  summary: "PATCH /organization/employee/absence/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_absence_me = defineRoute({
  name: "mobile.get.organization.employee.absence.me",
  method: "get",
  path: "/organization/employee/absence/me",
  tag: "mobile.absence",
  summary: "GET /organization/employee/absence/me",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_absence_id_sign = defineRoute({
  name: "mobile.post.organization.employee.absence.id.sign",
  method: "post",
  path: "/organization/employee/absence/{id}/sign",
  tag: "mobile.absence",
  summary: "POST /organization/employee/absence/{id}/sign",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileAbsenceRouter = createSlice([
  post_organization_employee_absence_id_sign,
  post_organization_employee_absence,
  delete_organization_employee_absence_id,
  get_organization_employee_absence_id,
  patch_organization_employee_absence_id,
  get_organization_employee_absence_me,
]);
