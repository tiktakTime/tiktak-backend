import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.vehiclePending");

const post_organization_vehicle = defineRoute({
  name: "web.post.organization.vehicle",
  method: "post",
  path: "/organization/vehicle",
  tag: "web.vehicle",
  summary: "POST /organization/vehicle",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_vehicle_id = defineRoute({
  name: "web.delete.organization.vehicle.id",
  method: "delete",
  path: "/organization/vehicle/{id}",
  tag: "web.vehicle",
  summary: "DELETE /organization/vehicle/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_id = defineRoute({
  name: "web.get.organization.vehicle.id",
  method: "get",
  path: "/organization/vehicle/{id}",
  tag: "web.vehicle",
  summary: "GET /organization/vehicle/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_vehicle_id = defineRoute({
  name: "web.patch.organization.vehicle.id",
  method: "patch",
  path: "/organization/vehicle/{id}",
  tag: "web.vehicle",
  summary: "PATCH /organization/vehicle/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_dashboard = defineRoute({
  name: "web.get.organization.vehicle.dashboard",
  method: "get",
  path: "/organization/vehicle/dashboard",
  tag: "web.vehicle",
  summary: "GET /organization/vehicle/dashboard",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_desired_vehicle_number = defineRoute({
  name: "web.get.organization.vehicle.desired-vehicle-number",
  method: "get",
  path: "/organization/vehicle/desired-vehicle-number",
  tag: "web.vehicle",
  summary: "GET /organization/vehicle/desired-vehicle-number",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_next_vehicle_number = defineRoute({
  name: "web.get.organization.vehicle.next-vehicle-number",
  method: "get",
  path: "/organization/vehicle/next-vehicle-number",
  tag: "web.vehicle",
  summary: "GET /organization/vehicle/next-vehicle-number",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_search = defineRoute({
  name: "web.get.organization.vehicle.search",
  method: "get",
  path: "/organization/vehicle/search",
  tag: "web.vehicle",
  summary: "GET /organization/vehicle/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehicleRouter = createSlice([
  post_organization_vehicle,
  delete_organization_vehicle_id,
  get_organization_vehicle_id,
  patch_organization_vehicle_id,
  get_organization_vehicle_dashboard,
  get_organization_vehicle_desired_vehicle_number,
  get_organization_vehicle_next_vehicle_number,
  get_organization_vehicle_search,
]);
