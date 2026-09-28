import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.officialPending");

const post_organization_company_official = defineRoute({
  name: "web.post.organization.company.official",
  method: "post",
  path: "/organization/company/official",
  tag: "web.official",
  summary: "POST /organization/company/official",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_company_official_id = defineRoute({
  name: "web.delete.organization.company.official.id",
  method: "delete",
  path: "/organization/company/official/{id}",
  tag: "web.official",
  summary: "DELETE /organization/company/official/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_official_id = defineRoute({
  name: "web.get.organization.company.official.id",
  method: "get",
  path: "/organization/company/official/{id}",
  tag: "web.official",
  summary: "GET /organization/company/official/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_company_official_id = defineRoute({
  name: "web.patch.organization.company.official.id",
  method: "patch",
  path: "/organization/company/official/{id}",
  tag: "web.official",
  summary: "PATCH /organization/company/official/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_official_search = defineRoute({
  name: "web.get.organization.company.official.search",
  method: "get",
  path: "/organization/company/official/search",
  tag: "web.official",
  summary: "GET /organization/company/official/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webOfficialRouter = createSlice([
  post_organization_company_official,
  delete_organization_company_official_id,
  get_organization_company_official_id,
  patch_organization_company_official_id,
  get_organization_company_official_search,
]);
