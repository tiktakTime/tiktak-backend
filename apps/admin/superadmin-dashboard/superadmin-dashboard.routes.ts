import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("AdminSuperadminDashboardPending");

const get_superadmin_dashboard = defineRoute({
  name: "admin.get.superadmin.dashboard",
  method: "get",
  path: "/superadmin/dashboard",
  tag: "admin.superadmin-dashboard",
  summary: "GET /superadmin/dashboard",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_superadmin_dashboard_online = defineRoute({
  name: "admin.get.superadmin.dashboard.online",
  method: "get",
  path: "/superadmin/dashboard/online",
  tag: "admin.superadmin-dashboard",
  summary: "GET /superadmin/dashboard/online",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const adminSuperadminDashboardRouter = createSlice([
  get_superadmin_dashboard,
  get_superadmin_dashboard_online,
]);
