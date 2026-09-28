import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.employeePending");

const post_organization_employee = defineRoute({
  name: "web.post.organization.employee",
  method: "post",
  path: "/organization/employee",
  tag: "web.employee",
  summary: "POST /organization/employee",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_employee_id = defineRoute({
  name: "web.delete.organization.employee.id",
  method: "delete",
  path: "/organization/employee/{id}",
  tag: "web.employee",
  summary: "DELETE /organization/employee/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_id = defineRoute({
  name: "web.get.organization.employee.id",
  method: "get",
  path: "/organization/employee/{id}",
  tag: "web.employee",
  summary: "GET /organization/employee/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_employee_id = defineRoute({
  name: "web.patch.organization.employee.id",
  method: "patch",
  path: "/organization/employee/{id}",
  tag: "web.employee",
  summary: "PATCH /organization/employee/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_creator = defineRoute({
  name: "web.post.organization.employee.creator",
  method: "post",
  path: "/organization/employee/creator",
  tag: "web.employee",
  summary: "POST /organization/employee/creator",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_dashboard = defineRoute({
  name: "web.get.organization.employee.dashboard",
  method: "get",
  path: "/organization/employee/dashboard",
  tag: "web.employee",
  summary: "GET /organization/employee/dashboard",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_desired_employee_no = defineRoute({
  name: "web.get.organization.employee.desired-employee-no",
  method: "get",
  path: "/organization/employee/desired-employee-no",
  tag: "web.employee",
  summary: "GET /organization/employee/desired-employee-no",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_get_next_employee_no = defineRoute({
  name: "web.get.organization.employee.get-next-employee-no",
  method: "get",
  path: "/organization/employee/get-next-employee-no",
  tag: "web.employee",
  summary: "GET /organization/employee/get-next-employee-no",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_search = defineRoute({
  name: "web.get.organization.employee.search",
  method: "get",
  path: "/organization/employee/search",
  tag: "web.employee",
  summary: "GET /organization/employee/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webEmployeeRouter = createSlice([
  post_organization_employee,
  delete_organization_employee_id,
  get_organization_employee_id,
  patch_organization_employee_id,
  post_organization_employee_creator,
  get_organization_employee_dashboard,
  get_organization_employee_desired_employee_no,
  get_organization_employee_get_next_employee_no,
  get_organization_employee_search,
]);
