import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.experiencePending");

const post_organization_employee_experience = defineRoute({
  name: "web.post.organization.employee.experience",
  method: "post",
  path: "/organization/employee/experience",
  tag: "web.experience",
  summary: "POST /organization/employee/experience",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_employee_experience_id = defineRoute({
  name: "web.delete.organization.employee.experience.id",
  method: "delete",
  path: "/organization/employee/experience/{id}",
  tag: "web.experience",
  summary: "DELETE /organization/employee/experience/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_employee_experience_search = defineRoute({
  name: "web.get.organization.employee.experience.search",
  method: "get",
  path: "/organization/employee/experience/search",
  tag: "web.experience",
  summary: "GET /organization/employee/experience/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_experience_with_terms = defineRoute({
  name: "web.post.organization.employee.experience.with-terms",
  method: "post",
  path: "/organization/employee/experience/with-terms",
  tag: "web.experience",
  summary: "POST /organization/employee/experience/with-terms",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_employee_experience_exit_preflight = defineRoute({
  name: "web.post.organization.employee.experience.exit-preflight",
  method: "post",
  path: "/organization/employee/experience/exit-preflight",
  tag: "web.experience",
  summary: "POST /organization/employee/experience/exit-preflight",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webExperienceRouter = createSlice([
  post_organization_employee_experience,
  delete_organization_employee_experience_id,
  get_organization_employee_experience_search,
  post_organization_employee_experience_with_terms,
  post_organization_employee_experience_exit_preflight,
]);
