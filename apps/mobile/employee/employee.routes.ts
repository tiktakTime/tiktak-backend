import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileEmployeePending");

const get_organization_employee_search = defineRoute({
  name: "mobile.get.organization.employee.search",
  method: "get",
  path: "/organization/employee/search",
  tag: "mobile.employee",
  summary: "GET /organization/employee/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileEmployeeRouter = createSlice([
  get_organization_employee_search,
]);
