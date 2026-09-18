import { z } from "@hono/zod-openapi";

import { TTL } from "@/core/cache";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  AccessCreateSchema,
  AccessIdParamSchema,
  AccessSchema,
  AccessSearchQuerySchema,
  AccessUpdateSchema,
} from "./access.schema";
import {
  createAccess,
  getAccess,
  removeAccess,
  searchAccess,
  updateAccess,
  upsertAccess,
} from "./domain";

const TAG = "access";
const BASE = "/organization/access";

const AccessIdResultSchema = z.object({ id: z.uuid() }).openapi("AccessId");

const search = defineRoute({
  name: "access.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search organization access rows",
  request: { query: AccessSearchQuerySchema },
  response: Page(AccessSchema, "Matching access rows"),
  tenant: "member",
  cache: { read: { ttl: TTL.DEFAULT, tags: ["access"] } },
  handle: ({ query, actorId }) => searchAccess(actorId, query),
});

const get = defineRoute({
  name: "access.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get access by id",
  request: { params: AccessIdParamSchema },
  response: Result(AccessSchema, "The access row"),
  tenant: "member",
  cache: { read: { ttl: TTL.LONG, tags: ["access"] } },
  handle: ({ params }) => getAccess(params.id),
});

const upsert = defineRoute({
  name: "access.upsert",
  method: "patch",
  path: `${BASE}/upsert-access`,
  tag: TAG,
  summary: "Upsert access by user + organization",
  request: { body: AccessCreateSchema },
  response: Result(AccessSchema, "Upserted"),
  tenant: "none",
  policy: ["access.patch"],
  cache: { write: { purge: ["access"] } },
  handle: ({ body }) => upsertAccess(body),
});

const create = defineRoute({
  name: "access.create",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create access",
  request: { body: AccessCreateSchema },
  response: Result(AccessSchema, "Created"),
  policy: ["access.post"],
  cache: { write: { purge: ["access"] } },
  handle: ({ body }) => createAccess(body),
});

const update = defineRoute({
  name: "access.update",
  method: "patch",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Update access",
  request: {
    params: AccessIdParamSchema,
    body: AccessUpdateSchema,
  },
  response: Result(AccessSchema, "Updated"),
  policy: ["access.patch"],
  cache: { write: { purge: ["access"] } },
  handle: ({ params, body }) => updateAccess(params.id, body),
});

const remove = defineRoute({
  name: "access.delete",
  method: "delete",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Delete access",
  request: { params: AccessIdParamSchema },
  response: Result(AccessIdResultSchema, "Deleted"),
  policy: ["access.delete"],
  cache: { write: { purge: ["access"] } },
  handle: ({ params }) => removeAccess(params.id),
});

export const accessRouter = createSlice([
  search,
  get,
  upsert,
  create,
  update,
  remove,
]);
