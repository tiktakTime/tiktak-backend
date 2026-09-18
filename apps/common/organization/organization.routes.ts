import { TTL } from "@/core/cache";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  createOrganizationWithOwner,
  getOrganization,
  restoreOrganization,
  searchOrganizations,
  softDeleteOrganization,
} from "./domain";
import {
  OrganizationCreateSchema,
  OrganizationIdParamSchema,
  OrganizationSchema,
  OrganizationSearchQuerySchema,
} from "./organization.schema";

const TAG = "organization";
const BASE = "/organization";

const search = defineRoute({
  name: "organization.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search organizations",
  request: { query: OrganizationSearchQuerySchema },
  response: Page(OrganizationSchema, "Matching organizations"),
  policy: ["organization.get"],
  tenant: "member",
  cache: { read: { ttl: TTL.DEFAULT, tags: ["organization"] } },
  handle: ({ query }) => searchOrganizations(query),
});

const create = defineRoute({
  name: "organization.create",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create organization",
  request: { body: OrganizationCreateSchema },
  response: Result(OrganizationSchema, "Created"),
  tenant: "member",
  cache: { write: { purge: ["organization"] } },
  handle: ({ body, actorId }) => createOrganizationWithOwner(body, actorId),
});

const restore = defineRoute({
  name: "organization.restore",
  method: "patch",
  path: `${BASE}/{id}/restore`,
  tag: TAG,
  summary: "Restore soft-deleted organization",
  request: { params: OrganizationIdParamSchema },
  response: Result(OrganizationSchema, "Restored"),
  policy: ["organization.patch"],
  tenant: "orgParam",
  cache: { write: { purge: ["organization"] } },
  handle: ({ params }) => restoreOrganization(params.id),
});

const get = defineRoute({
  name: "organization.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get organization by id",
  request: { params: OrganizationIdParamSchema },
  response: Result(OrganizationSchema, "The organization"),
  policy: ["organization.get"],
  tenant: "orgParam",
  cache: { read: { ttl: TTL.LONG, tags: ["organization"] } },
  handle: ({ params }) => getOrganization(params.id),
});

const remove = defineRoute({
  name: "organization.delete",
  method: "delete",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Soft-delete organization",
  request: { params: OrganizationIdParamSchema },
  response: Result(OrganizationIdParamSchema, "Deleted"),
  policy: ["organization.delete"],
  tenant: "orgParam",
  cache: { write: { purge: ["organization"] } },
  handle: ({ params }) => softDeleteOrganization(params.id),
});

export const organizationRouter = createSlice([
  search,
  create,
  restore,
  get,
  remove,
]);
