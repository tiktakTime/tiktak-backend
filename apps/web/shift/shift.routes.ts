import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.shiftPending");

const post_organization_work_shift = defineRoute({
  name: "web.post.organization.work.shift",
  method: "post",
  path: "/organization/work/shift",
  tag: "web.shift",
  summary: "POST /organization/work/shift",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_work_shift_id = defineRoute({
  name: "web.delete.organization.work.shift.id",
  method: "delete",
  path: "/organization/work/shift/{id}",
  tag: "web.shift",
  summary: "DELETE /organization/work/shift/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_shift_id = defineRoute({
  name: "web.patch.organization.work.shift.id",
  method: "patch",
  path: "/organization/work/shift/{id}",
  tag: "web.shift",
  summary: "PATCH /organization/work/shift/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_shift_search = defineRoute({
  name: "web.get.organization.work.shift.search",
  method: "get",
  path: "/organization/work/shift/search",
  tag: "web.shift",
  summary: "GET /organization/work/shift/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webShiftRouter = createSlice([
  post_organization_work_shift,
  delete_organization_work_shift_id,
  patch_organization_work_shift_id,
  get_organization_work_shift_search,
]);
