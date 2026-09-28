import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.vehicleActivityPending");

const delete_organization_vehicle_vehicle_id_activities_activity_id =
  defineRoute({
    name: "web.delete.organization.vehicle.vehicle_id.activities.activity_id",
    method: "delete",
    path: "/organization/vehicle/{vehicle_id}/activities/{activity_id}",
    tag: "web.vehicle-activity",
    summary:
      "DELETE /organization/vehicle/{vehicle_id}/activities/{activity_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const get_organization_vehicle_vehicle_id_activities_activity_id = defineRoute({
  name: "web.get.organization.vehicle.vehicle_id.activities.activity_id",
  method: "get",
  path: "/organization/vehicle/{vehicle_id}/activities/{activity_id}",
  tag: "web.vehicle-activity",
  summary: "GET /organization/vehicle/{vehicle_id}/activities/{activity_id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_vehicle_id_activities_search = defineRoute({
  name: "web.get.organization.vehicle.vehicle_id.activities.search",
  method: "get",
  path: "/organization/vehicle/{vehicle_id}/activities/search",
  tag: "web.vehicle-activity",
  summary: "GET /organization/vehicle/{vehicle_id}/activities/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_activity_search = defineRoute({
  name: "web.get.organization.vehicle.activity.search",
  method: "get",
  path: "/organization/vehicle/activity/search",
  tag: "web.vehicle-activity",
  summary: "GET /organization/vehicle/activity/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_vehicle_vehicle_id_activities_activity_id =
  defineRoute({
    name: "web.patch.organization.vehicle.vehicle_id.activities.activity_id",
    method: "patch",
    path: "/organization/vehicle/{vehicle_id}/activities/{activity_id}",
    tag: "web.vehicle-activity",
    summary:
      "PATCH /organization/vehicle/{vehicle_id}/activities/{activity_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const post_organization_vehicle_vehicle_id_activities = defineRoute({
  name: "web.post.organization.vehicle.vehicle_id.activities",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/activities",
  tag: "web.vehicle-activity",
  summary: "POST /organization/vehicle/{vehicle_id}/activities",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehicleActivityRouter = createSlice([
  delete_organization_vehicle_vehicle_id_activities_activity_id,
  get_organization_vehicle_vehicle_id_activities_activity_id,
  get_organization_vehicle_vehicle_id_activities_search,
  get_organization_vehicle_activity_search,
  patch_organization_vehicle_vehicle_id_activities_activity_id,
  post_organization_vehicle_vehicle_id_activities,
]);
