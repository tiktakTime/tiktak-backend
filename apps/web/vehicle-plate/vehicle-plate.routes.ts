import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.vehiclePlatePending");

const post_organization_vehicle_plate = defineRoute({
  name: "web.post.organization.vehicle.plate",
  method: "post",
  path: "/organization/vehicle/plate",
  tag: "web.vehicle-plate",
  summary: "POST /organization/vehicle/plate",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_vehicle_plate_id = defineRoute({
  name: "web.delete.organization.vehicle.plate.id",
  method: "delete",
  path: "/organization/vehicle/plate/{id}",
  tag: "web.vehicle-plate",
  summary: "DELETE /organization/vehicle/plate/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_plate_desired_plate = defineRoute({
  name: "web.get.organization.vehicle.plate.desired-plate",
  method: "get",
  path: "/organization/vehicle/plate/desired-plate",
  tag: "web.vehicle-plate",
  summary: "GET /organization/vehicle/plate/desired-plate",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_plate_history = defineRoute({
  name: "web.get.organization.vehicle.plate.history",
  method: "get",
  path: "/organization/vehicle/plate/history",
  tag: "web.vehicle-plate",
  summary: "GET /organization/vehicle/plate/history",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_plate_search = defineRoute({
  name: "web.get.organization.vehicle.plate.search",
  method: "get",
  path: "/organization/vehicle/plate/search",
  tag: "web.vehicle-plate",
  summary: "GET /organization/vehicle/plate/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehiclePlateRouter = createSlice([
  post_organization_vehicle_plate,
  delete_organization_vehicle_plate_id,
  get_organization_vehicle_plate_desired_plate,
  get_organization_vehicle_plate_history,
  get_organization_vehicle_plate_search,
]);
