import { z } from "@hono/zod-openapi";

import { TTL } from "@/core/cache";
import { AppError } from "@/core/errors";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  createRole,
  getRole,
  searchRoles,
  softDeleteRole,
  updateRole,
} from "./domain";
import {
  RoleCreateSchema,
  RoleIdParamSchema,
  RoleSchema,
  RoleSearchQuerySchema,
  RoleUpdateSchema,
} from "./role.schema";

const TAG = "role";
const BASE = "/organization/role";

const RoleIdResultSchema = z.object({ id: z.uuid() }).openapi("RoleId");

const search = defineRoute({
  name: "role.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search roles",
  request: { query: RoleSearchQuerySchema },
  response: Page(RoleSchema, "Matching roles"),
  tenant: "org",
  policy: ["role.get"],
  cache: { read: { ttl: TTL.DEFAULT, tags: ["role"] } },
  handle: ({ tenantId, query }) => searchRoles(tenantId, query),
});

const withPermission = defineRoute({
  name: "role.with-permission",
  method: "get",
  path: `${BASE}/with/permission`,
  tag: TAG,
  summary: "List roles with their permissions",
  request: { query: RoleSearchQuerySchema },
  response: Page(
    z.object({}).passthrough().openapi("RoleWithPermission"),
    "Roles with permissions",
  ),
  tenant: "org",
  cache: { read: { ttl: TTL.DEFAULT, tags: ["role"] } },
  handle: ({ tenantId, query }) => {
    void tenantId;
    void query;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const create = defineRoute({
  name: "role.create",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create role",
  request: { body: RoleCreateSchema },
  response: Result(RoleSchema, "Created"),
  tenant: "org",
  policy: ["role.post"],
  cache: { write: { purge: ["role"] } },
  handle: ({ tenantId, body }) => createRole(tenantId, body),
});

const update = defineRoute({
  name: "role.update",
  method: "patch",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Update role",
  request: {
    params: RoleIdParamSchema,
    body: RoleUpdateSchema,
  },
  response: Result(RoleSchema, "Updated"),
  tenant: "org",
  policy: ["role.patch"],
  cache: { write: { purge: ["role"] } },
  handle: ({ params, body }) => updateRole(params.id, body),
});

const remove = defineRoute({
  name: "role.delete",
  method: "delete",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Soft-delete role",
  request: { params: RoleIdParamSchema },
  response: Result(RoleIdResultSchema, "Deleted"),
  tenant: "org",
  policy: ["role.delete"],
  cache: { write: { purge: ["role"] } },
  handle: ({ tenantId, params }) => softDeleteRole(tenantId, params.id),
});

const get = defineRoute({
  name: "role.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get role by id",
  request: { params: RoleIdParamSchema },
  response: Result(RoleSchema, "The role"),
  tenant: "org",
  policy: ["role.get"],
  cache: { read: { ttl: TTL.LONG, tags: ["role"] } },
  handle: ({ params }) => getRole(params.id),
});

export const roleRouter = createSlice([
  search,
  withPermission,
  create,
  update,
  remove,
  get,
]);
