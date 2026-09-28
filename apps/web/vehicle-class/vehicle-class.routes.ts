import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.vehicleClassPending");

const get_organization_vehicle_class_search = defineRoute({
  name: "web.get.organization.vehicle.class.search",
  method: "get",
  path: "/organization/vehicle/class/search",
  tag: "web.vehicle-class",
  summary: "GET /organization/vehicle/class/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehicleClassRouter = createSlice([
  get_organization_vehicle_class_search,
]);
