import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.contractPending");

const post_organization_company_company_id_contract = defineRoute({
  name: "web.post.organization.company.company_id.contract",
  method: "post",
  path: "/organization/company/{company_id}/contract",
  tag: "web.contract",
  summary: "POST /organization/company/{company_id}/contract",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_company_company_id_contract_id = defineRoute({
  name: "web.delete.organization.company.company_id.contract.id",
  method: "delete",
  path: "/organization/company/{company_id}/contract/{id}",
  tag: "web.contract",
  summary: "DELETE /organization/company/{company_id}/contract/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_company_company_id_contract_id = defineRoute({
  name: "web.get.organization.company.company_id.contract.id",
  method: "get",
  path: "/organization/company/{company_id}/contract/{id}",
  tag: "web.contract",
  summary: "GET /organization/company/{company_id}/contract/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_company_company_id_contract_id = defineRoute({
  name: "web.patch.organization.company.company_id.contract.id",
  method: "patch",
  path: "/organization/company/{company_id}/contract/{id}",
  tag: "web.contract",
  summary: "PATCH /organization/company/{company_id}/contract/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webContractRouter = createSlice([
  post_organization_company_company_id_contract,
  delete_organization_company_company_id_contract_id,
  get_organization_company_company_id_contract_id,
  patch_organization_company_company_id_contract_id,
]);
