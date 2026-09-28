import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("MobileVehicleAssignmentPending");

const get_organization_vehicle_assignment_search = defineRoute({
  name: "mobile.get.organization.vehicle.assignment.search",
  method: "get",
  path: "/organization/vehicle/assignment/search",
  tag: "mobile.vehicle-assignment",
  summary: "GET /organization/vehicle/assignment/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_vehicle_id_assignments_entry = defineRoute({
  name: "mobile.post.organization.vehicle.vehicle_id.assignments.entry",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/assignments/entry",
  tag: "mobile.vehicle-assignment",
  summary: "POST /organization/vehicle/{vehicle_id}/assignments/entry",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_vehicle_id_assignments_exit = defineRoute({
  name: "mobile.post.organization.vehicle.vehicle_id.assignments.exit",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/assignments/exit",
  tag: "mobile.vehicle-assignment",
  summary: "POST /organization/vehicle/{vehicle_id}/assignments/exit",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_vehicle_id_assignments_request = defineRoute({
  name: "mobile.post.organization.vehicle.vehicle_id.assignments.request",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/assignments/request",
  tag: "mobile.vehicle-assignment",
  summary: "POST /organization/vehicle/{vehicle_id}/assignments/request",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_vehicle_id_assignments_assignment_id_respond =
  defineRoute({
    name: "mobile.post.organization.vehicle.vehicle_id.assignments.assignment_id.respond",
    method: "post",
    path: "/organization/vehicle/{vehicle_id}/assignments/{assignment_id}/respond",
    tag: "mobile.vehicle-assignment",
    summary:
      "POST /organization/vehicle/{vehicle_id}/assignments/{assignment_id}/respond",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

export const mobileVehicleAssignmentRouter = createSlice([
  post_organization_vehicle_vehicle_id_assignments_entry,
  post_organization_vehicle_vehicle_id_assignments_exit,
  post_organization_vehicle_vehicle_id_assignments_request,
  post_organization_vehicle_vehicle_id_assignments_assignment_id_respond,
  get_organization_vehicle_assignment_search,
]);
