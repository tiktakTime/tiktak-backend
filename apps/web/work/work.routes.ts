import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.workPending");

const post_organization_work = defineRoute({
  name: "web.post.organization.work",
  method: "post",
  path: "/organization/work",
  tag: "web.work",
  summary: "POST /organization/work",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_work_id = defineRoute({
  name: "web.delete.organization.work.id",
  method: "delete",
  path: "/organization/work/{id}",
  tag: "web.work",
  summary: "DELETE /organization/work/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_id = defineRoute({
  name: "web.get.organization.work.id",
  method: "get",
  path: "/organization/work/{id}",
  tag: "web.work",
  summary: "GET /organization/work/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_id = defineRoute({
  name: "web.patch.organization.work.id",
  method: "patch",
  path: "/organization/work/{id}",
  tag: "web.work",
  summary: "PATCH /organization/work/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_id_location_log = defineRoute({
  name: "web.get.organization.work.id.location-log",
  method: "get",
  path: "/organization/work/{id}/location-log",
  tag: "web.work",
  summary: "GET /organization/work/{id}/location-log",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_id_series_content = defineRoute({
  name: "web.patch.organization.work.id.series.content",
  method: "patch",
  path: "/organization/work/{id}/series/content",
  tag: "web.work",
  summary: "PATCH /organization/work/{id}/series/content",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_id_series_impact = defineRoute({
  name: "web.get.organization.work.id.series.impact",
  method: "get",
  path: "/organization/work/{id}/series/impact",
  tag: "web.work",
  summary: "GET /organization/work/{id}/series/impact",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_id_series_rebuild = defineRoute({
  name: "web.post.organization.work.id.series.rebuild",
  method: "post",
  path: "/organization/work/{id}/series/rebuild",
  tag: "web.work",
  summary: "POST /organization/work/{id}/series/rebuild",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_id_series_unrepeat = defineRoute({
  name: "web.post.organization.work.id.series.unrepeat",
  method: "post",
  path: "/organization/work/{id}/series/unrepeat",
  tag: "web.work",
  summary: "POST /organization/work/{id}/series/unrepeat",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_id_timeline = defineRoute({
  name: "web.get.organization.work.id.timeline",
  method: "get",
  path: "/organization/work/{id}/timeline",
  tag: "web.work",
  summary: "GET /organization/work/{id}/timeline",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_id_timeline = defineRoute({
  name: "web.post.organization.work.id.timeline",
  method: "post",
  path: "/organization/work/{id}/timeline",
  tag: "web.work",
  summary: "POST /organization/work/{id}/timeline",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_id_timeline_reset = defineRoute({
  name: "web.post.organization.work.id.timeline.reset",
  method: "post",
  path: "/organization/work/{id}/timeline/reset",
  tag: "web.work",
  summary: "POST /organization/work/{id}/timeline/reset",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_dashboard = defineRoute({
  name: "web.get.organization.work.dashboard",
  method: "get",
  path: "/organization/work/dashboard",
  tag: "web.work",
  summary: "GET /organization/work/dashboard",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_order_id_reset = defineRoute({
  name: "web.post.organization.work.order.id.reset",
  method: "post",
  path: "/organization/work/order/{id}/reset",
  tag: "web.work",
  summary: "POST /organization/work/order/{id}/reset",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_order_id_status = defineRoute({
  name: "web.patch.organization.work.order.id.status",
  method: "patch",
  path: "/organization/work/order/{id}/status",
  tag: "web.work",
  summary: "PATCH /organization/work/order/{id}/status",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_order_work_order_id_work_values = defineRoute({
  name: "web.get.organization.work.order.work_order_id.work-values",
  method: "get",
  path: "/organization/work/order/{work_order_id}/work-values",
  tag: "web.work",
  summary: "GET /organization/work/order/{work_order_id}/work-values",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_order_work_order_id_work_values = defineRoute({
  name: "web.post.organization.work.order.work_order_id.work-values",
  method: "post",
  path: "/organization/work/order/{work_order_id}/work-values",
  tag: "web.work",
  summary: "POST /organization/work/order/{work_order_id}/work-values",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_repeat_conflicts = defineRoute({
  name: "web.post.organization.work.repeat.conflicts",
  method: "post",
  path: "/organization/work/repeat/conflicts",
  tag: "web.work",
  summary: "POST /organization/work/repeat/conflicts",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_search = defineRoute({
  name: "web.get.organization.work.search",
  method: "get",
  path: "/organization/work/search",
  tag: "web.work",
  summary: "GET /organization/work/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webWorkRouter = createSlice([
  post_organization_work,
  delete_organization_work_id,
  get_organization_work_id,
  patch_organization_work_id,
  get_organization_work_id_location_log,
  patch_organization_work_id_series_content,
  get_organization_work_id_series_impact,
  post_organization_work_id_series_rebuild,
  post_organization_work_id_series_unrepeat,
  get_organization_work_id_timeline,
  post_organization_work_id_timeline,
  post_organization_work_id_timeline_reset,
  get_organization_work_dashboard,
  post_organization_work_order_id_reset,
  patch_organization_work_order_id_status,
  get_organization_work_order_work_order_id_work_values,
  post_organization_work_order_work_order_id_work_values,
  post_organization_work_repeat_conflicts,
  get_organization_work_search,
]);
