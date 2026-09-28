import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.locationPending");

const post_organization_company_location = defineRoute({
  name: "web.post.organization.company.location",
  method: "post",
  path: "/organization/company/location",
  tag: "web.location",
  summary: "POST /organization/company/location",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_company_location_id = defineRoute({
  name: "web.delete.organization.company.location.id",
  method: "delete",
  path: "/organization/company/location/{id}",
  tag: "web.location",
  summary: "DELETE /organization/company/location/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_location_id = defineRoute({
  name: "web.get.organization.company.location.id",
  method: "get",
  path: "/organization/company/location/{id}",
  tag: "web.location",
  summary: "GET /organization/company/location/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_company_location_id = defineRoute({
  name: "web.patch.organization.company.location.id",
  method: "patch",
  path: "/organization/company/location/{id}",
  tag: "web.location",
  summary: "PATCH /organization/company/location/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_location_search = defineRoute({
  name: "web.get.organization.company.location.search",
  method: "get",
  path: "/organization/company/location/search",
  tag: "web.location",
  summary: "GET /organization/company/location/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webLocationRouter = createSlice([
  post_organization_company_location,
  delete_organization_company_location_id,
  get_organization_company_location_id,
  patch_organization_company_location_id,
  get_organization_company_location_search,
]);
