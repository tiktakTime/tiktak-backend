import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("CommonAccessPending");

const get_organization_access_search = defineRoute({
  name: "common.get.organization.access.search",
  method: "get",
  path: "/organization/access/search",
  tag: "common.access",
  summary: "GET /organization/access/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_access_upsert_access = defineRoute({
  name: "common.patch.organization.access.upsert-access",
  method: "patch",
  path: "/organization/access/upsert-access",
  tag: "common.access",
  summary: "PATCH /organization/access/upsert-access",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const commonAccessRouter = createSlice([
  get_organization_access_search,
  patch_organization_access_upsert_access,
]);
