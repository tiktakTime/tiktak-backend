import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.transactionPending");

const post_organization_settlement_transaction = defineRoute({
  name: "web.post.organization.settlement.transaction",
  method: "post",
  path: "/organization/settlement/transaction",
  tag: "web.transaction",
  summary: "POST /organization/settlement/transaction",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_settlement_transaction_id = defineRoute({
  name: "web.delete.organization.settlement.transaction.id",
  method: "delete",
  path: "/organization/settlement/transaction/{id}",
  tag: "web.transaction",
  summary: "DELETE /organization/settlement/transaction/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_settlement_transaction_id = defineRoute({
  name: "web.patch.organization.settlement.transaction.id",
  method: "patch",
  path: "/organization/settlement/transaction/{id}",
  tag: "web.transaction",
  summary: "PATCH /organization/settlement/transaction/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_transaction_id_stamp = defineRoute({
  name: "web.post.organization.settlement.transaction.id.stamp",
  method: "post",
  path: "/organization/settlement/transaction/{id}/stamp",
  tag: "web.transaction",
  summary: "POST /organization/settlement/transaction/{id}/stamp",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_organization_settlement_transaction_id_unstamp = defineRoute({
  name: "web.post.organization.settlement.transaction.id.unstamp",
  method: "post",
  path: "/organization/settlement/transaction/{id}/unstamp",
  tag: "web.transaction",
  summary: "POST /organization/settlement/transaction/{id}/unstamp",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_organization_settlement_transaction_search = defineRoute({
  name: "web.get.organization.settlement.transaction.search",
  method: "get",
  path: "/organization/settlement/transaction/search",
  tag: "web.transaction",
  summary: "GET /organization/settlement/transaction/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_settlement_transaction_id_cancel = defineRoute({
  name: "web.patch.organization.settlement.transaction.id.cancel",
  method: "patch",
  path: "/organization/settlement/transaction/{id}/cancel",
  tag: "web.transaction",
  summary: "PATCH /organization/settlement/transaction/{id}/cancel",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webTransactionRouter = createSlice([
  post_organization_settlement_transaction,
  delete_organization_settlement_transaction_id,
  patch_organization_settlement_transaction_id,
  post_organization_settlement_transaction_id_stamp,
  post_organization_settlement_transaction_id_unstamp,
  get_organization_settlement_transaction_search,
  patch_organization_settlement_transaction_id_cancel,
]);
