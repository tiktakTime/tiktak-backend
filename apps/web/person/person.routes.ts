import { z } from "@hono/zod-openapi";

import { TTL } from "@/core/cache";
import { AppError } from "@/core/errors";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  createPerson,
  getPerson,
  restorePerson,
  searchPersons,
  softDeletePerson,
  updatePerson,
} from "./domain";
import {
  PersonCompareQuerySchema,
  PersonCreateSchema,
  PersonIdParamSchema,
  PersonMatchWithUserBodySchema,
  PersonRolePermissionBodySchema,
  PersonSchema,
  PersonSearchQuerySchema,
  PersonSearchWithUserQuerySchema,
  PersonUpdateSchema,
} from "./person.schema";

const TAG = "person";
const BASE = "/organization/person";

const PersonIdResultSchema = z.object({ id: z.uuid() }).openapi("PersonId");

const search = defineRoute({
  name: "person.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search persons",
  request: { query: PersonSearchQuerySchema },
  response: Page(PersonSchema, "Matching persons"),
  tenant: "org",
  policy: ["person.get"],
  cache: { read: { ttl: TTL.DEFAULT, tags: ["person"] } },
  handle: ({ tenantId, query }) => searchPersons(tenantId, query),
});

const searchWithUser = defineRoute({
  name: "person.search-with-user",
  method: "get",
  path: `${BASE}/search-with-user`,
  tag: TAG,
  summary: "Search persons with user data",
  request: { query: PersonSearchWithUserQuerySchema },
  response: Page(PersonSchema, "Matching persons with user info"),
  tenant: "org",
  handle: ({ tenantId, query }) => {
    void tenantId;
    void query;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const dashboard = defineRoute({
  name: "person.dashboard",
  method: "get",
  path: `${BASE}/dashboard`,
  tag: TAG,
  summary: "Person dashboard statistics",
  response: Page(z.object({}).passthrough().openapi("PersonDashboardRow")),
  tenant: "org",
  handle: ({ tenantId }) => {
    void tenantId;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const compareWithUser = defineRoute({
  name: "person.compare-with-user",
  method: "get",
  path: `${BASE}/compare-with-user`,
  tag: TAG,
  summary: "Compare person with user",
  request: { query: PersonCompareQuerySchema },
  response: Result(
    z.object({}).passthrough().openapi("PersonCompare"),
    "Comparison result",
  ),
  tenant: "org",
  handle: ({ tenantId, query }) => {
    void tenantId;
    void query;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const matchWithUser = defineRoute({
  name: "person.match-with-user",
  method: "post",
  path: `${BASE}/match-with-user`,
  tag: TAG,
  summary: "Match person with user",
  request: {
    query: z.object({ user_id: z.uuid() }),
    body: PersonMatchWithUserBodySchema,
  },
  response: Result(
    z.object({}).passthrough().openapi("PersonMatch"),
    "Match result",
  ),
  tenant: "org",
  handle: ({ tenantId, query, body }) => {
    void tenantId;
    void query;
    void body;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const create = defineRoute({
  name: "person.create",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create person",
  request: { body: PersonCreateSchema },
  response: Result(PersonSchema, "Created"),
  tenant: "org",
  policy: ["person.post"],
  cache: { write: { purge: ["person"] } },
  handle: ({ tenantId, body }) => createPerson(tenantId, body),
});

const rolePermissionGet = defineRoute({
  name: "person.role-permission.get",
  method: "get",
  path: `${BASE}/{id}/role-permission`,
  tag: TAG,
  summary: "Get person role + custom permissions",
  request: { params: PersonIdParamSchema },
  response: Result(
    z.object({}).passthrough().openapi("PersonRolePermission"),
    "Role and permissions",
  ),
  tenant: "org",
  cache: { read: { ttl: TTL.DEFAULT, tags: ["person"] } },
  handle: ({ tenantId, params }) => {
    void tenantId;
    void params;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const rolePermissionUpdate = defineRoute({
  name: "person.role-permission.update",
  method: "patch",
  path: `${BASE}/{id}/role-permission`,
  tag: TAG,
  summary: "Update person role + custom permissions",
  request: {
    params: PersonIdParamSchema,
    body: PersonRolePermissionBodySchema,
  },
  response: Result(
    z.object({}).passthrough().openapi("PersonRolePermissionUpdated"),
    "Updated",
  ),
  tenant: "org",
  handle: ({ tenantId, params, body }) => {
    void tenantId;
    void params;
    void body;
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const restore = defineRoute({
  name: "person.restore",
  method: "patch",
  path: `${BASE}/{id}/restore`,
  tag: TAG,
  summary: "Restore soft-deleted person",
  request: { params: PersonIdParamSchema },
  response: Result(PersonSchema, "Restored"),
  tenant: "org",
  policy: ["person.patch"],
  cache: { write: { purge: ["person"] } },
  handle: ({ tenantId, params }) => restorePerson(tenantId, params.id),
});

const get = defineRoute({
  name: "person.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get person by id",
  request: { params: PersonIdParamSchema },
  response: Result(PersonSchema, "The person"),
  tenant: "org",
  policy: ["person.get"],
  cache: { read: { ttl: TTL.LONG, tags: ["person"] } },
  handle: ({ tenantId, params }) => getPerson(tenantId, params.id),
});

const update = defineRoute({
  name: "person.update",
  method: "patch",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Update person",
  request: {
    params: PersonIdParamSchema,
    body: PersonUpdateSchema,
  },
  response: Result(PersonSchema, "Updated"),
  tenant: "org",
  policy: ["person.patch"],
  cache: { write: { purge: ["person"] } },
  handle: ({ tenantId, params, body }) =>
    updatePerson(tenantId, params.id, body),
});

const remove = defineRoute({
  name: "person.delete",
  method: "delete",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Soft-delete person",
  request: { params: PersonIdParamSchema },
  response: Result(PersonIdResultSchema, "Deleted"),
  tenant: "org",
  policy: ["person.delete"],
  cache: { write: { purge: ["person"] } },
  handle: ({ tenantId, params, actorId }) =>
    softDeletePerson(tenantId, params.id, actorId),
});

export const personRouter = createSlice([
  search,
  searchWithUser,
  dashboard,
  compareWithUser,
  matchWithUser,
  create,
  rolePermissionGet,
  rolePermissionUpdate,
  restore,
  get,
  update,
  remove,
]);
