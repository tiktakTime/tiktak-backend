import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.departmentPending");

const post_organization_department = defineRoute({
  name: "web.post.organization.department",
  method: "post",
  path: "/organization/department",
  tag: "web.department",
  summary: "POST /organization/department",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_department_id = defineRoute({
  name: "web.delete.organization.department.id",
  method: "delete",
  path: "/organization/department/{id}",
  tag: "web.department",
  summary: "DELETE /organization/department/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_department_id = defineRoute({
  name: "web.patch.organization.department.id",
  method: "patch",
  path: "/organization/department/{id}",
  tag: "web.department",
  summary: "PATCH /organization/department/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_department_id_usage = defineRoute({
  name: "web.get.organization.department.id.usage",
  method: "get",
  path: "/organization/department/{id}/usage",
  tag: "web.department",
  summary: "GET /organization/department/{id}/usage",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_department_search = defineRoute({
  name: "web.get.organization.department.search",
  method: "get",
  path: "/organization/department/search",
  tag: "web.department",
  summary: "GET /organization/department/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webDepartmentRouter = createSlice([
  post_organization_department,
  delete_organization_department_id,
  patch_organization_department_id,
  get_organization_department_id_usage,
  get_organization_department_search,
]);
