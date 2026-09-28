import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.permissionPending");

const get_organization_permission_search = defineRoute({
  name: "web.get.organization.permission.search",
  method: "get",
  path: "/organization/permission/search",
  tag: "web.permission",
  summary: "GET /organization/permission/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webPermissionRouter = createSlice([
  get_organization_permission_search,
]);
