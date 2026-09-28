import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.employeeLedgerPending");

const get_organization_employee_ledger_id = defineRoute({
  name: "web.get.organization.employee.ledger.id",
  method: "get",
  path: "/organization/employee/ledger/{id}",
  tag: "web.employee-ledger",
  summary: "GET /organization/employee/ledger/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webEmployeeLedgerRouter = createSlice([
  get_organization_employee_ledger_id,
]);
