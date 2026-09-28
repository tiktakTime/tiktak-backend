import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.settlementPending");

const get_organization_settlement_id = defineRoute({
  name: "web.get.organization.settlement.id",
  method: "get",
  path: "/organization/settlement/{id}",
  tag: "web.settlement",
  summary: "GET /organization/settlement/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_settlement_id = defineRoute({
  name: "web.patch.organization.settlement.id",
  method: "patch",
  path: "/organization/settlement/{id}",
  tag: "web.settlement",
  summary: "PATCH /organization/settlement/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_id_agreement_adjust = defineRoute({
  name: "web.post.organization.settlement.id.agreement-adjust",
  method: "post",
  path: "/organization/settlement/{id}/agreement-adjust",
  tag: "web.settlement",
  summary: "POST /organization/settlement/{id}/agreement-adjust",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_id_agreement_refresh = defineRoute({
  name: "web.post.organization.settlement.id.agreement-refresh",
  method: "post",
  path: "/organization/settlement/{id}/agreement-refresh",
  tag: "web.settlement",
  summary: "POST /organization/settlement/{id}/agreement-refresh",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_id_agreement_stamp = defineRoute({
  name: "web.post.organization.settlement.id.agreement-stamp",
  method: "post",
  path: "/organization/settlement/{id}/agreement-stamp",
  tag: "web.settlement",
  summary: "POST /organization/settlement/{id}/agreement-stamp",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_id_work_adjust = defineRoute({
  name: "web.post.organization.settlement.id.work-adjust",
  method: "post",
  path: "/organization/settlement/{id}/work-adjust",
  tag: "web.settlement",
  summary: "POST /organization/settlement/{id}/work-adjust",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_id_work_include = defineRoute({
  name: "web.post.organization.settlement.id.work-include",
  method: "post",
  path: "/organization/settlement/{id}/work-include",
  tag: "web.settlement",
  summary: "POST /organization/settlement/{id}/work-include",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_settlement_work_id = defineRoute({
  name: "web.get.organization.settlement.work.id",
  method: "get",
  path: "/organization/settlement/work/{id}",
  tag: "web.settlement",
  summary: "GET /organization/settlement/work/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_work_id_stamp = defineRoute({
  name: "web.post.organization.settlement.work.id.stamp",
  method: "post",
  path: "/organization/settlement/work/{id}/stamp",
  tag: "web.settlement",
  summary: "POST /organization/settlement/work/{id}/stamp",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_settlement_work_id_summary = defineRoute({
  name: "web.get.organization.settlement.work.id.summary",
  method: "get",
  path: "/organization/settlement/work/{id}/summary",
  tag: "web.settlement",
  summary: "GET /organization/settlement/work/{id}/summary",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_settlement_id_status = defineRoute({
  name: "web.patch.organization.settlement.id.status",
  method: "patch",
  path: "/organization/settlement/{id}/status",
  tag: "web.settlement",
  summary: "PATCH /organization/settlement/{id}/status",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webSettlementRouter = createSlice([
  get_organization_settlement_id,
  patch_organization_settlement_id,
  post_organization_settlement_id_agreement_adjust,
  post_organization_settlement_id_agreement_refresh,
  post_organization_settlement_id_agreement_stamp,
  post_organization_settlement_id_work_adjust,
  post_organization_settlement_id_work_include,
  get_organization_settlement_work_id,
  post_organization_settlement_work_id_stamp,
  get_organization_settlement_work_id_summary,
  patch_organization_settlement_id_status,
]);
