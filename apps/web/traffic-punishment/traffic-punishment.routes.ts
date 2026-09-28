import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.trafficPunishmentPending");

const post_organization_vehicle_traffic_punishment = defineRoute({
  name: "web.post.organization.vehicle.traffic-punishment",
  method: "post",
  path: "/organization/vehicle/traffic-punishment",
  tag: "web.traffic-punishment",
  summary: "POST /organization/vehicle/traffic-punishment",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_vehicle_traffic_punishment_id = defineRoute({
  name: "web.delete.organization.vehicle.traffic-punishment.id",
  method: "delete",
  path: "/organization/vehicle/traffic-punishment/{id}",
  tag: "web.traffic-punishment",
  summary: "DELETE /organization/vehicle/traffic-punishment/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_traffic_punishment_id = defineRoute({
  name: "web.get.organization.vehicle.traffic-punishment.id",
  method: "get",
  path: "/organization/vehicle/traffic-punishment/{id}",
  tag: "web.traffic-punishment",
  summary: "GET /organization/vehicle/traffic-punishment/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_vehicle_traffic_punishment_id = defineRoute({
  name: "web.patch.organization.vehicle.traffic-punishment.id",
  method: "patch",
  path: "/organization/vehicle/traffic-punishment/{id}",
  tag: "web.traffic-punishment",
  summary: "PATCH /organization/vehicle/traffic-punishment/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_traffic_punishment_id_send_email = defineRoute({
  name: "web.post.organization.vehicle.traffic-punishment.id.send-email",
  method: "post",
  path: "/organization/vehicle/traffic-punishment/{id}/send-email",
  tag: "web.traffic-punishment",
  summary: "POST /organization/vehicle/traffic-punishment/{id}/send-email",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_traffic_punishment_duplicate_check =
  defineRoute({
    name: "web.post.organization.vehicle.traffic-punishment.duplicate-check",
    method: "post",
    path: "/organization/vehicle/traffic-punishment/duplicate-check",
    tag: "web.traffic-punishment",
    summary: "POST /organization/vehicle/traffic-punishment/duplicate-check",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const get_organization_vehicle_traffic_punishment_search = defineRoute({
  name: "web.get.organization.vehicle.traffic-punishment.search",
  method: "get",
  path: "/organization/vehicle/traffic-punishment/search",
  tag: "web.traffic-punishment",
  summary: "GET /organization/vehicle/traffic-punishment/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webTrafficPunishmentRouter = createSlice([
  post_organization_vehicle_traffic_punishment,
  delete_organization_vehicle_traffic_punishment_id,
  get_organization_vehicle_traffic_punishment_id,
  patch_organization_vehicle_traffic_punishment_id,
  post_organization_vehicle_traffic_punishment_id_send_email,
  post_organization_vehicle_traffic_punishment_duplicate_check,
  get_organization_vehicle_traffic_punishment_search,
]);
