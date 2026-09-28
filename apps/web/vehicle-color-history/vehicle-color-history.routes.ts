import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.vehicleColorHistoryPending");

const post_organization_vehicle_vehicle_id_color_history = defineRoute({
  name: "web.post.organization.vehicle.vehicle_id.color-history",
  method: "post",
  path: "/organization/vehicle/{vehicle_id}/color-history",
  tag: "web.vehicle-color-history",
  summary: "POST /organization/vehicle/{vehicle_id}/color-history",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webVehicleColorHistoryRouter = createSlice([
  post_organization_vehicle_vehicle_id_color_history,
]);
