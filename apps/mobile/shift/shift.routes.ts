import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileShiftPending");

const get_organization_work_shift_search = defineRoute({
  name: "mobile.get.organization.work.shift.search",
  method: "get",
  path: "/organization/work/shift/search",
  tag: "mobile.shift",
  summary: "GET /organization/work/shift/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileShiftRouter = createSlice([
  get_organization_work_shift_search,
]);
