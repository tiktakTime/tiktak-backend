import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Admin.superadminVehiclePending");

const post_superadmin_vehicle_brand = defineRoute({
  name: "admin.post.superadmin.vehicle.brand",
  method: "post",
  path: "/superadmin/vehicle/brand",
  tag: "admin.superadmin-vehicle",
  summary: "POST /superadmin/vehicle/brand",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_superadmin_vehicle_brand_id = defineRoute({
  name: "admin.delete.superadmin.vehicle.brand.id",
  method: "delete",
  path: "/superadmin/vehicle/brand/{id}",
  tag: "admin.superadmin-vehicle",
  summary: "DELETE /superadmin/vehicle/brand/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_vehicle_brand_id = defineRoute({
  name: "admin.patch.superadmin.vehicle.brand.id",
  method: "patch",
  path: "/superadmin/vehicle/brand/{id}",
  tag: "admin.superadmin-vehicle",
  summary: "PATCH /superadmin/vehicle/brand/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_superadmin_vehicle_class = defineRoute({
  name: "admin.post.superadmin.vehicle.class",
  method: "post",
  path: "/superadmin/vehicle/class",
  tag: "admin.superadmin-vehicle",
  summary: "POST /superadmin/vehicle/class",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_superadmin_vehicle_class_id = defineRoute({
  name: "admin.delete.superadmin.vehicle.class.id",
  method: "delete",
  path: "/superadmin/vehicle/class/{id}",
  tag: "admin.superadmin-vehicle",
  summary: "DELETE /superadmin/vehicle/class/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_vehicle_class_id = defineRoute({
  name: "admin.patch.superadmin.vehicle.class.id",
  method: "patch",
  path: "/superadmin/vehicle/class/{id}",
  tag: "admin.superadmin-vehicle",
  summary: "PATCH /superadmin/vehicle/class/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_superadmin_vehicle_model = defineRoute({
  name: "admin.post.superadmin.vehicle.model",
  method: "post",
  path: "/superadmin/vehicle/model",
  tag: "admin.superadmin-vehicle",
  summary: "POST /superadmin/vehicle/model",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_superadmin_vehicle_model_id = defineRoute({
  name: "admin.delete.superadmin.vehicle.model.id",
  method: "delete",
  path: "/superadmin/vehicle/model/{id}",
  tag: "admin.superadmin-vehicle",
  summary: "DELETE /superadmin/vehicle/model/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_superadmin_vehicle_model_id = defineRoute({
  name: "admin.patch.superadmin.vehicle.model.id",
  method: "patch",
  path: "/superadmin/vehicle/model/{id}",
  tag: "admin.superadmin-vehicle",
  summary: "PATCH /superadmin/vehicle/model/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const adminSuperadminVehicleRouter = createSlice([
  post_superadmin_vehicle_brand,
  delete_superadmin_vehicle_brand_id,
  patch_superadmin_vehicle_brand_id,
  post_superadmin_vehicle_class,
  delete_superadmin_vehicle_class_id,
  patch_superadmin_vehicle_class_id,
  post_superadmin_vehicle_model,
  delete_superadmin_vehicle_model_id,
  patch_superadmin_vehicle_model_id,
]);
