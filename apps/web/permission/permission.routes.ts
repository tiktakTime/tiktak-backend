import { z } from "@hono/zod-openapi";

import { TTL } from "@/core/cache";
import { AppError } from "@/core/errors";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  createPermission,
  getPermission,
  searchPermissions,
  softDeletePermission,
  updatePermission,
} from "./domain";
import {
  PermissionCreateSchema,
  PermissionIdParamSchema,
  PermissionSchema,
  PermissionSearchQuerySchema,
  PermissionUpdateSchema,
} from "./permission.schema";

const TAG = "permission";
const BASE = "/organization/permission";

const PermissionIdResultSchema = z
  .object({ id: z.uuid() })
  .openapi("PermissionId");

const search = defineRoute({
  name: "permission.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search permissions",
  request: { query: PermissionSearchQuerySchema },
  response: Page(PermissionSchema, "Matching permissions"),
  tenant: "org",
  policy: ["permission.get"],
  cache: { read: { ttl: TTL.DEFAULT, tags: ["permission"] } },
  handle: ({ tenantId, query }) => searchPermissions(tenantId, query),
});

const withRole = defineRoute({
  name: "permission.with-role",
  method: "get",
  path: `${BASE}/with/role`,
  tag: TAG,
  summary: "List permissions with their roles",
  request: { query: PermissionSearchQuerySchema },
  response: Page(
    z.object({}).passthrough().openapi("PermissionWithRole"),
    "Permissions with roles",
  ),
  tenant: "org",
  cache: { read: { ttl: TTL.DEFAULT, tags: ["permission"] } },
  handle: ({ tenantId, query }) => {
    void tenantId;
    void query;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const create = defineRoute({
  name: "permission.create",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create permission",
  request: { body: PermissionCreateSchema },
  response: Result(PermissionSchema, "Created"),
  tenant: "org",
  policy: ["permission.post"],
  cache: { write: { purge: ["permission"] } },
  handle: ({ tenantId, body }) => createPermission(tenantId, body),
});

const update = defineRoute({
  name: "permission.update",
  method: "patch",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Update permission",
  request: {
    params: PermissionIdParamSchema,
    body: PermissionUpdateSchema,
  },
  response: Result(PermissionSchema, "Updated"),
  tenant: "org",
  policy: ["permission.patch"],
  cache: { write: { purge: ["permission"] } },
  handle: ({ params, body }) => updatePermission(params.id, body),
});

const remove = defineRoute({
  name: "permission.delete",
  method: "delete",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Soft-delete permission",
  request: { params: PermissionIdParamSchema },
  response: Result(PermissionIdResultSchema, "Deleted"),
  tenant: "org",
  policy: ["permission.delete"],
  cache: { write: { purge: ["permission"] } },
  handle: ({ tenantId, params }) => softDeletePermission(tenantId, params.id),
});

const get = defineRoute({
  name: "permission.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get permission by id",
  request: { params: PermissionIdParamSchema },
  response: Result(PermissionSchema, "The permission"),
  tenant: "org",
  policy: ["permission.get"],
  cache: { read: { ttl: TTL.LONG, tags: ["permission"] } },
  handle: ({ params }) => getPermission(params.id),
});

export const permissionRouter = createSlice([
  search,
  withRole,
  create,
  update,
  remove,
  get,
]);
