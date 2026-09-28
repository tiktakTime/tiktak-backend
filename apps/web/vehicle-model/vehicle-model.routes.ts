import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.vehicleModelPending");

const get_organization_vehicle_model_search = defineRoute({
  name: "web.get.organization.vehicle.model.search",
  method: "get",
  path: "/organization/vehicle/model/search",
  tag: "web.vehicle-model",
  summary: "GET /organization/vehicle/model/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehicleModelRouter = createSlice([
  get_organization_vehicle_model_search,
]);
