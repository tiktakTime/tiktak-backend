import { z } from "@hono/zod-openapi";

import { TTL } from "@/core/cache";
import { AppError } from "@/core/errors";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  createEmployee,
  createEmployeeViaCreator,
  getEmployee,
  isEmployeeNoTaken,
  nextEmployeeNo,
  searchEmployees,
  softDeleteEmployee,
  updateEmployee,
} from "./domain";
import {
  DesiredEmployeeNoQuerySchema,
  EmployeeCreateSchema,
  EmployeeCreatorSchema,
  EmployeeIdParamSchema,
  EmployeeSchema,
  EmployeeSearchQuerySchema,
  EmployeeUpdateSchema,
  NextEmployeeNoQuerySchema,
} from "./employee.schema";

const TAG = "employee";
const BASE = "/organization/employee";

const DesiredNoResultSchema = z
  .object({
    desired_no: z.number().int(),
    available: z.boolean(),
  })
  .openapi("DesiredEmployeeNo");

const NextNoResultSchema = z
  .object({ employee_no: z.number().int() })
  .openapi("NextEmployeeNo");

const EmployeeIdResultSchema = z.object({ id: z.uuid() }).openapi("EmployeeId");

const search = defineRoute({
  name: "employee.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search employees",
  request: { query: EmployeeSearchQuerySchema },
  response: Page(EmployeeSchema, "Matching employees"),
  tenant: "org",
  policy: ["employee.get"],
  cache: { read: { ttl: TTL.DEFAULT, tags: ["employee"] } },
  handle: ({ tenantId, query }) => searchEmployees(tenantId, query),
});

const dashboard = defineRoute({
  name: "employee.dashboard",
  method: "get",
  path: `${BASE}/dashboard`,
  tag: TAG,
  summary: "Employee dashboard statistics",
  response: Page(z.object({}).passthrough().openapi("EmployeeDashboardRow")),
  tenant: "org",
  handle: ({ tenantId }) => {
    void tenantId;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const detail = defineRoute({
  name: "employee.detail",
  method: "get",
  path: `${BASE}/detail/{id}`,
  tag: TAG,
  summary: "Get employee detail",
  request: { params: EmployeeIdParamSchema },
  response: Result(
    z.object({}).passthrough().openapi("EmployeeDetail"),
    "Employee detail",
  ),
  tenant: "org",
  cache: { read: { ttl: TTL.DEFAULT, tags: ["employee"] } },
  handle: ({ tenantId, params }) => {
    void tenantId;
    void params;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const desiredNo = defineRoute({
  name: "employee.desired-no",
  method: "get",
  path: `${BASE}/desired-employee-no`,
  tag: TAG,
  summary: "Check whether a desired employee number is free",
  request: { query: DesiredEmployeeNoQuerySchema },
  response: Result(DesiredNoResultSchema, "Availability"),
  tenant: "org",
  policy: ["employee.get"],
  cache: { read: { ttl: TTL.MISS, tags: ["employee", "employee_no"] } },
  handle: async ({ tenantId, query }) => {
    const taken = await isEmployeeNoTaken(tenantId, query.desired_no);
    return { desired_no: query.desired_no, available: !taken };
  },
});

const nextNo = defineRoute({
  name: "employee.next-no",
  method: "get",
  path: `${BASE}/get-next-employee-no`,
  tag: TAG,
  summary: "Next available employee number",
  request: { query: NextEmployeeNoQuerySchema },
  response: Result(NextNoResultSchema, "Next number"),
  tenant: "org",
  policy: ["employee.get"],
  cache: { read: { ttl: TTL.MISS, tags: ["employee", "employee_no"] } },
  handle: async ({ tenantId, query }) => {
    void query;
    return { employee_no: await nextEmployeeNo(tenantId) };
  },
});

const creator = defineRoute({
  name: "employee.create",
  method: "post",
  path: `${BASE}/creator`,
  tag: TAG,
  summary: "Create employee via creator (person + company + experience)",
  request: { body: EmployeeCreatorSchema },
  response: Result(EmployeeSchema, "Created"),
  tenant: "org",
  policy: ["employee.post"],
  cache: { write: { purge: ["employee", "employee_no"] } },
  handle: async ({ tenantId, body }) => {
    const result = await createEmployeeViaCreator(tenantId, body);
    return result.employee;
  },
});

const create = defineRoute({
  name: "employee.create-direct",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create employee",
  request: { body: EmployeeCreateSchema },
  response: Result(EmployeeSchema, "Created"),
  tenant: "org",
  policy: ["employee.post"],
  cache: { write: { purge: ["employee", "employee_no"] } },
  handle: ({ tenantId, body }) => createEmployee(tenantId, body),
});

const get = defineRoute({
  name: "employee.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get employee by id",
  request: { params: EmployeeIdParamSchema },
  response: Result(EmployeeSchema, "The employee"),
  tenant: "org",
  policy: ["employee.get"],
  cache: { read: { ttl: TTL.LONG, tags: ["employee"] } },
  handle: ({ tenantId, params }) => getEmployee(tenantId, params.id),
});

const update = defineRoute({
  name: "employee.update",
  method: "patch",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Update employee",
  request: {
    params: EmployeeIdParamSchema,
    body: EmployeeUpdateSchema,
  },
  response: Result(EmployeeSchema, "Updated"),
  tenant: "org",
  policy: ["employee.patch"],
  cache: { write: { purge: ["employee", "employee_no"] } },
  handle: ({ tenantId, params, body }) =>
    updateEmployee(tenantId, params.id, body),
});

const remove = defineRoute({
  name: "employee.delete",
  method: "delete",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Soft-delete employee",
  request: { params: EmployeeIdParamSchema },
  response: Result(EmployeeIdResultSchema, "Deleted"),
  tenant: "org",
  policy: ["employee.delete"],
  cache: { write: { purge: ["employee", "employee_no"] } },
  handle: ({ tenantId, params }) => softDeleteEmployee(tenantId, params.id),
});

export const employeeRouter = createSlice([
  search,
  dashboard,
  detail,
  desiredNo,
  nextNo,
  creator,
  create,
  get,
  update,
  remove,
]);
