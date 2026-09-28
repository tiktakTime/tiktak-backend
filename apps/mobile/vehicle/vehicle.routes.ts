import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileVehiclePending");

const get_organization_vehicle_id = defineRoute({
  name: "mobile.get.organization.vehicle.id",
  method: "get",
  path: "/organization/vehicle/{id}",
  tag: "mobile.vehicle",
  summary: "GET /organization/vehicle/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_vehicle_id_self = defineRoute({
  name: "mobile.patch.organization.vehicle.id.self",
  method: "patch",
  path: "/organization/vehicle/{id}/self",
  tag: "mobile.vehicle",
  summary: "PATCH /organization/vehicle/{id}/self",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_search = defineRoute({
  name: "mobile.get.organization.vehicle.search",
  method: "get",
  path: "/organization/vehicle/search",
  tag: "mobile.vehicle",
  summary: "GET /organization/vehicle/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileVehicleRouter = createSlice([
  get_organization_vehicle_id,
  patch_organization_vehicle_id_self,
  get_organization_vehicle_search,
]);
