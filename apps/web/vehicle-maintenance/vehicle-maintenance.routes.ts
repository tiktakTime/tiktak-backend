import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.vehicleMaintenancePending");

const post_organization_vehicle_vehicle_id_maintenance = defineRoute({
  name: "web.post.organization.vehicle.vehicle_id.maintenance",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/maintenance",
  tag: "web.vehicle-maintenance",
  summary: "POST /organization/vehicle/{vehicle_id}/maintenance",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_vehicle_vehicle_id_maintenance_maintenance_id =
  defineRoute({
    name: "web.delete.organization.vehicle.vehicle_id.maintenance.maintenance_id",
    method: "delete",
    path: "/organization/vehicle/{vehicle_id}/maintenance/{maintenance_id}",
    tag: "web.vehicle-maintenance",
    summary:
      "DELETE /organization/vehicle/{vehicle_id}/maintenance/{maintenance_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const patch_organization_vehicle_vehicle_id_maintenance_maintenance_id =
  defineRoute({
    name: "web.patch.organization.vehicle.vehicle_id.maintenance.maintenance_id",
    method: "patch",
    path: "/organization/vehicle/{vehicle_id}/maintenance/{maintenance_id}",
    tag: "web.vehicle-maintenance",
    summary:
      "PATCH /organization/vehicle/{vehicle_id}/maintenance/{maintenance_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const get_organization_vehicle_vehicle_id_maintenance_search = defineRoute({
  name: "web.get.organization.vehicle.vehicle_id.maintenance.search",
  method: "get",
  path: "/organization/vehicle/{vehicle_id}/maintenance/search",
  tag: "web.vehicle-maintenance",
  summary: "GET /organization/vehicle/{vehicle_id}/maintenance/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehicleMaintenanceRouter = createSlice([
  post_organization_vehicle_vehicle_id_maintenance,
  delete_organization_vehicle_vehicle_id_maintenance_maintenance_id,
  patch_organization_vehicle_vehicle_id_maintenance_maintenance_id,
  get_organization_vehicle_vehicle_id_maintenance_search,
]);
