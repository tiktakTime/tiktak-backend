import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.companyPending");

const post_organization_company = defineRoute({
  name: "web.post.organization.company",
  method: "post",
  path: "/organization/company",
  tag: "web.company",
  summary: "POST /organization/company",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_company_id = defineRoute({
  name: "web.delete.organization.company.id",
  method: "delete",
  path: "/organization/company/{id}",
  tag: "web.company",
  summary: "DELETE /organization/company/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_id = defineRoute({
  name: "web.get.organization.company.id",
  method: "get",
  path: "/organization/company/{id}",
  tag: "web.company",
  summary: "GET /organization/company/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_company_id = defineRoute({
  name: "web.patch.organization.company.id",
  method: "patch",
  path: "/organization/company/{id}",
  tag: "web.company",
  summary: "PATCH /organization/company/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_dashboard = defineRoute({
  name: "web.get.organization.company.dashboard",
  method: "get",
  path: "/organization/company/dashboard",
  tag: "web.company",
  summary: "GET /organization/company/dashboard",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_reference_reference_id = defineRoute({
  name: "web.get.organization.company.reference.reference_id",
  method: "get",
  path: "/organization/company/reference/{reference_id}",
  tag: "web.company",
  summary: "GET /organization/company/reference/{reference_id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_search = defineRoute({
  name: "web.get.organization.company.search",
  method: "get",
  path: "/organization/company/search",
  tag: "web.company",
  summary: "GET /organization/company/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webCompanyRouter = createSlice([
  post_organization_company,
  delete_organization_company_id,
  get_organization_company_id,
  patch_organization_company_id,
  get_organization_company_dashboard,
  get_organization_company_reference_reference_id,
  get_organization_company_search,
]);
