import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileWorkPending");

const get_organization_work_id = defineRoute({
  name: "mobile.get.organization.work.id",
  method: "get",
  path: "/organization/work/{id}",
  tag: "mobile.work",
  summary: "GET /organization/work/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_id = defineRoute({
  name: "mobile.patch.organization.work.id",
  method: "patch",
  path: "/organization/work/{id}",
  tag: "mobile.work",
  summary: "PATCH /organization/work/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_id_timeline = defineRoute({
  name: "mobile.get.organization.work.id.timeline",
  method: "get",
  path: "/organization/work/{id}/timeline",
  tag: "mobile.work",
  summary: "GET /organization/work/{id}/timeline",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_id_timeline = defineRoute({
  name: "mobile.post.organization.work.id.timeline",
  method: "post",
  path: "/organization/work/{id}/timeline",
  tag: "mobile.work",
  summary: "POST /organization/work/{id}/timeline",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_dashboard_me = defineRoute({
  name: "mobile.get.organization.work.dashboard.me",
  method: "get",
  path: "/organization/work/dashboard/me",
  tag: "mobile.work",
  summary: "GET /organization/work/dashboard/me",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_my_active = defineRoute({
  name: "mobile.get.organization.work.my-active",
  method: "get",
  path: "/organization/work/my-active",
  tag: "mobile.work",
  summary: "GET /organization/work/my-active",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_my_schedule = defineRoute({
  name: "mobile.get.organization.work.my-schedule",
  method: "get",
  path: "/organization/work/my-schedule",
  tag: "mobile.work",
  summary: "GET /organization/work/my-schedule",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_order_id = defineRoute({
  name: "mobile.get.organization.work.order.id",
  method: "get",
  path: "/organization/work/order/{id}",
  tag: "mobile.work",
  summary: "GET /organization/work/order/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_order_search = defineRoute({
  name: "mobile.get.organization.work.order.search",
  method: "get",
  path: "/organization/work/order/search",
  tag: "mobile.work",
  summary: "GET /organization/work/order/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_search = defineRoute({
  name: "mobile.get.organization.work.search",
  method: "get",
  path: "/organization/work/search",
  tag: "mobile.work",
  summary: "GET /organization/work/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_self = defineRoute({
  name: "mobile.post.organization.work.self",
  method: "post",
  path: "/organization/work/self",
  tag: "mobile.work",
  summary: "POST /organization/work/self",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_work_self_id = defineRoute({
  name: "mobile.delete.organization.work.self.id",
  method: "delete",
  path: "/organization/work/self/{id}",
  tag: "mobile.work",
  summary: "DELETE /organization/work/self/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_self_id = defineRoute({
  name: "mobile.patch.organization.work.self.id",
  method: "patch",
  path: "/organization/work/self/{id}",
  tag: "mobile.work",
  summary: "PATCH /organization/work/self/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_id_location_log = defineRoute({
  name: "mobile.get.organization.work.id.location-log",
  method: "get",
  path: "/organization/work/{id}/location-log",
  tag: "mobile.work",
  summary: "GET /organization/work/{id}/location-log",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_id_location_log = defineRoute({
  name: "mobile.post.organization.work.id.location-log",
  method: "post",
  path: "/organization/work/{id}/location-log",
  tag: "mobile.work",
  summary: "POST /organization/work/{id}/location-log",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_id_timeline_batch = defineRoute({
  name: "mobile.patch.organization.work.id.timeline.batch",
  method: "patch",
  path: "/organization/work/{id}/timeline/batch",
  tag: "mobile.work",
  summary: "PATCH /organization/work/{id}/timeline/batch",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_work_work_id_timeline_events_event_id = defineRoute({
  name: "mobile.delete.organization.work.work_id.timeline.events.event_id",
  method: "delete",
  path: "/organization/work/{work_id}/timeline/events/{event_id}",
  tag: "mobile.work",
  summary: "DELETE /organization/work/{work_id}/timeline/events/{event_id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_id_timeline_reset = defineRoute({
  name: "mobile.post.organization.work.id.timeline.reset",
  method: "post",
  path: "/organization/work/{id}/timeline/reset",
  tag: "mobile.work",
  summary: "POST /organization/work/{id}/timeline/reset",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_work_order_id_status = defineRoute({
  name: "mobile.patch.organization.work.order.id.status",
  method: "patch",
  path: "/organization/work/order/{id}/status",
  tag: "mobile.work",
  summary: "PATCH /organization/work/order/{id}/status",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_order_id_reset = defineRoute({
  name: "mobile.post.organization.work.order.id.reset",
  method: "post",
  path: "/organization/work/order/{id}/reset",
  tag: "mobile.work",
  summary: "POST /organization/work/order/{id}/reset",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_work_order_id_work_values = defineRoute({
  name: "mobile.get.organization.work.order.id.work-values",
  method: "get",
  path: "/organization/work/order/{id}/work-values",
  tag: "mobile.work",
  summary: "GET /organization/work/order/{id}/work-values",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_work_order_id_work_values = defineRoute({
  name: "mobile.post.organization.work.order.id.work-values",
  method: "post",
  path: "/organization/work/order/{id}/work-values",
  tag: "mobile.work",
  summary: "POST /organization/work/order/{id}/work-values",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileWorkRouter = createSlice([
  get_organization_work_id_location_log,
  post_organization_work_id_location_log,
  patch_organization_work_id_timeline_batch,
  delete_organization_work_work_id_timeline_events_event_id,
  post_organization_work_id_timeline_reset,
  patch_organization_work_order_id_status,
  post_organization_work_order_id_reset,
  get_organization_work_order_id_work_values,
  post_organization_work_order_id_work_values,
  get_organization_work_id,
  patch_organization_work_id,
  get_organization_work_id_timeline,
  post_organization_work_id_timeline,
  get_organization_work_dashboard_me,
  get_organization_work_my_active,
  get_organization_work_my_schedule,
  get_organization_work_order_id,
  get_organization_work_order_search,
  get_organization_work_search,
  post_organization_work_self,
  delete_organization_work_self_id,
  patch_organization_work_self_id,
]);
