import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.jobTitlePending");

const post_organization_job_title = defineRoute({
  name: "web.post.organization.job-title",
  method: "post",
  path: "/organization/job-title",
  tag: "web.job-title",
  summary: "POST /organization/job-title",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_job_title_id = defineRoute({
  name: "web.delete.organization.job-title.id",
  method: "delete",
  path: "/organization/job-title/{id}",
  tag: "web.job-title",
  summary: "DELETE /organization/job-title/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_job_title_id = defineRoute({
  name: "web.get.organization.job-title.id",
  method: "get",
  path: "/organization/job-title/{id}",
  tag: "web.job-title",
  summary: "GET /organization/job-title/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_job_title_id = defineRoute({
  name: "web.patch.organization.job-title.id",
  method: "patch",
  path: "/organization/job-title/{id}",
  tag: "web.job-title",
  summary: "PATCH /organization/job-title/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_job_title_id_usage = defineRoute({
  name: "web.get.organization.job-title.id.usage",
  method: "get",
  path: "/organization/job-title/{id}/usage",
  tag: "web.job-title",
  summary: "GET /organization/job-title/{id}/usage",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webJobTitleRouter = createSlice([
  post_organization_job_title,
  delete_organization_job_title_id,
  get_organization_job_title_id,
  patch_organization_job_title_id,
  get_organization_job_title_id_usage,
]);
