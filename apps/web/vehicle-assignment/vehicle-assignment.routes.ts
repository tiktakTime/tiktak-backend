import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.vehicleAssignmentPending");

const delete_organization_vehicle_vehicle_id_assignments_assignment_id =
  defineRoute({
    name: "web.delete.organization.vehicle.vehicle_id.assignments.assignment_id",
    method: "delete",
    path: "/organization/vehicle/{vehicle_id}/assignments/{assignment_id}",
    tag: "web.vehicle-assignment",
    summary:
      "DELETE /organization/vehicle/{vehicle_id}/assignments/{assignment_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const post_organization_vehicle_vehicle_id_assignments_exit = defineRoute({
  name: "web.post.organization.vehicle.vehicle_id.assignments.exit",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/assignments/exit",
  tag: "web.vehicle-assignment",
  summary: "POST /organization/vehicle/{vehicle_id}/assignments/exit",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_vehicle_id_assignments_request = defineRoute({
  name: "web.post.organization.vehicle.vehicle_id.assignments.request",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/assignments/request",
  tag: "web.vehicle-assignment",
  summary: "POST /organization/vehicle/{vehicle_id}/assignments/request",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_assignment_assignment_id = defineRoute({
  name: "web.get.organization.vehicle.assignment.assignment_id",
  method: "get",
  path: "/organization/vehicle/assignment/{assignment_id}",
  tag: "web.vehicle-assignment",
  summary: "GET /organization/vehicle/assignment/{assignment_id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_assignment_current = defineRoute({
  name: "web.get.organization.vehicle.assignment.current",
  method: "get",
  path: "/organization/vehicle/assignment/current",
  tag: "web.vehicle-assignment",
  summary: "GET /organization/vehicle/assignment/current",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_vehicle_assignment_search = defineRoute({
  name: "web.get.organization.vehicle.assignment.search",
  method: "get",
  path: "/organization/vehicle/assignment/search",
  tag: "web.vehicle-assignment",
  summary: "GET /organization/vehicle/assignment/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_vehicle_vehicle_id_assignments_assignment_id =
  defineRoute({
    name: "web.patch.organization.vehicle.vehicle_id.assignments.assignment_id",
    method: "patch",
    path: "/organization/vehicle/{vehicle_id}/assignments/{assignment_id}",
    tag: "web.vehicle-assignment",
    summary:
      "PATCH /organization/vehicle/{vehicle_id}/assignments/{assignment_id}",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

const post_organization_vehicle_vehicle_id_assignments = defineRoute({
  name: "web.post.organization.vehicle.vehicle_id.assignments",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/assignments",
  tag: "web.vehicle-assignment",
  summary: "POST /organization/vehicle/{vehicle_id}/assignments",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_vehicle_id_assignments_entry = defineRoute({
  name: "web.post.organization.vehicle.vehicle_id.assignments.entry",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/assignments/entry",
  tag: "web.vehicle-assignment",
  summary: "POST /organization/vehicle/{vehicle_id}/assignments/entry",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_vehicle_vehicle_id_assignments_assignment_id_respond =
  defineRoute({
    name: "web.post.organization.vehicle.vehicle_id.assignments.assignment_id.respond",
    method: "post",
    path: "/organization/vehicle/{vehicle_id}/assignments/{assignment_id}/respond",
    tag: "web.vehicle-assignment",
    summary:
      "POST /organization/vehicle/{vehicle_id}/assignments/{assignment_id}/respond",
    response: Result(Pending),
    tenant: "none",
    handle: () => {
      throw new AppError("NOT_IMPLEMENTED");
    },
  });

export const webVehicleAssignmentRouter = createSlice([
  delete_organization_vehicle_vehicle_id_assignments_assignment_id,
  post_organization_vehicle_vehicle_id_assignments_exit,
  post_organization_vehicle_vehicle_id_assignments_request,
  get_organization_vehicle_assignment_assignment_id,
  get_organization_vehicle_assignment_current,
  get_organization_vehicle_assignment_search,
  patch_organization_vehicle_vehicle_id_assignments_assignment_id,
  post_organization_vehicle_vehicle_id_assignments,
  post_organization_vehicle_vehicle_id_assignments_entry,
  post_organization_vehicle_vehicle_id_assignments_assignment_id_respond,
]);
