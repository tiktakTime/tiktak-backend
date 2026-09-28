import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.vehicleBrandPending");

const get_organization_vehicle_brand_search = defineRoute({
  name: "web.get.organization.vehicle.brand.search",
  method: "get",
  path: "/organization/vehicle/brand/search",
  tag: "web.vehicle-brand",
  summary: "GET /organization/vehicle/brand/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehicleBrandRouter = createSlice([
  get_organization_vehicle_brand_search,
]);
