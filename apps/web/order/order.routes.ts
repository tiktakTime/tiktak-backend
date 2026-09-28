import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.orderPending");

const post_organization_order = defineRoute({
  name: "web.post.organization.order",
  method: "post",
  path: "/organization/order",
  tag: "web.order",
  summary: "POST /organization/order",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_order_id = defineRoute({
  name: "web.delete.organization.order.id",
  method: "delete",
  path: "/organization/order/{id}",
  tag: "web.order",
  summary: "DELETE /organization/order/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_id = defineRoute({
  name: "web.get.organization.order.id",
  method: "get",
  path: "/organization/order/{id}",
  tag: "web.order",
  summary: "GET /organization/order/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_order_id = defineRoute({
  name: "web.patch.organization.order.id",
  method: "patch",
  path: "/organization/order/{id}",
  tag: "web.order",
  summary: "PATCH /organization/order/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_order_id_content_values = defineRoute({
  name: "web.get.organization.order.order_id.content-values",
  method: "get",
  path: "/organization/order/{order_id}/content-values",
  tag: "web.order",
  summary: "GET /organization/order/{order_id}/content-values",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_order_order_id_content_values = defineRoute({
  name: "web.post.organization.order.order_id.content-values",
  method: "post",
  path: "/organization/order/{order_id}/content-values",
  tag: "web.order",
  summary: "POST /organization/order/{order_id}/content-values",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_order_id_work_order_values_totals = defineRoute({
  name: "web.get.organization.order.order_id.work-order-values.totals",
  method: "get",
  path: "/organization/order/{order_id}/work-order-values/totals",
  tag: "web.order",
  summary: "GET /organization/order/{order_id}/work-order-values/totals",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_order_id_work_orders_search = defineRoute({
  name: "web.get.organization.order.order_id.work-orders.search",
  method: "get",
  path: "/organization/order/{order_id}/work-orders/search",
  tag: "web.order",
  summary: "GET /organization/order/{order_id}/work-orders/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_order_pricing_bulk = defineRoute({
  name: "web.post.organization.order.pricing.bulk",
  method: "post",
  path: "/organization/order/pricing/bulk",
  tag: "web.order",
  summary: "POST /organization/order/pricing/bulk",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_order_pricing_employee_order = defineRoute({
  name: "web.delete.organization.order.pricing.employee-order",
  method: "delete",
  path: "/organization/order/pricing/employee-order",
  tag: "web.order",
  summary: "DELETE /organization/order/pricing/employee-order",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_order_pricing_group_apply = defineRoute({
  name: "web.post.organization.order.pricing.group-apply",
  method: "post",
  path: "/organization/order/pricing/group-apply",
  tag: "web.order",
  summary: "POST /organization/order/pricing/group-apply",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_pricing_search_employee_order = defineRoute({
  name: "web.get.organization.order.pricing.search-employee-order",
  method: "get",
  path: "/organization/order/pricing/search-employee-order",
  tag: "web.order",
  summary: "GET /organization/order/pricing/search-employee-order",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_pricing_search_employee_orders = defineRoute({
  name: "web.get.organization.order.pricing.search-employee-orders",
  method: "get",
  path: "/organization/order/pricing/search-employee-orders",
  tag: "web.order",
  summary: "GET /organization/order/pricing/search-employee-orders",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_pricing_search_order = defineRoute({
  name: "web.get.organization.order.pricing.search-order",
  method: "get",
  path: "/organization/order/pricing/search-order",
  tag: "web.order",
  summary: "GET /organization/order/pricing/search-order",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_search = defineRoute({
  name: "web.get.organization.order.search",
  method: "get",
  path: "/organization/order/search",
  tag: "web.order",
  summary: "GET /organization/order/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webOrderRouter = createSlice([
  post_organization_order,
  delete_organization_order_id,
  get_organization_order_id,
  patch_organization_order_id,
  get_organization_order_order_id_content_values,
  post_organization_order_order_id_content_values,
  get_organization_order_order_id_work_order_values_totals,
  get_organization_order_order_id_work_orders_search,
  post_organization_order_pricing_bulk,
  delete_organization_order_pricing_employee_order,
  post_organization_order_pricing_group_apply,
  get_organization_order_pricing_search_employee_order,
  get_organization_order_pricing_search_employee_orders,
  get_organization_order_pricing_search_order,
  get_organization_order_search,
]);
