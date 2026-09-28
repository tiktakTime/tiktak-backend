import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileOrderPending");

const get_organization_order_search_self = defineRoute({
  name: "mobile.get.organization.order.search.self",
  method: "get",
  path: "/organization/order/search/self",
  tag: "mobile.order",
  summary: "GET /organization/order/search/self",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_order_order_id_content_values = defineRoute({
  name: "mobile.get.organization.order.order_id.content-values",
  method: "get",
  path: "/organization/order/{order_id}/content-values",
  tag: "mobile.order",
  summary: "GET /organization/order/{order_id}/content-values",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileOrderRouter = createSlice([
  get_organization_order_order_id_content_values,
  get_organization_order_search_self,
]);
