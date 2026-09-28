import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z
  .object({})
  .passthrough()
  .openapi("Web.transactionCategoryPending");

const post_organization_settlement_transaction_category = defineRoute({
  name: "web.post.organization.settlement.transaction-category",
  method: "post",
  path: "/organization/settlement/transaction-category",
  tag: "web.transaction-category",
  summary: "POST /organization/settlement/transaction-category",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_organization_settlement_transaction_category_id = defineRoute({
  name: "web.delete.organization.settlement.transaction-category.id",
  method: "delete",
  path: "/organization/settlement/transaction-category/{id}",
  tag: "web.transaction-category",
  summary: "DELETE /organization/settlement/transaction-category/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_organization_settlement_transaction_category_id = defineRoute({
  name: "web.patch.organization.settlement.transaction-category.id",
  method: "patch",
  path: "/organization/settlement/transaction-category/{id}",
  tag: "web.transaction-category",
  summary: "PATCH /organization/settlement/transaction-category/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webTransactionCategoryRouter = createSlice([
  post_organization_settlement_transaction_category,
  delete_organization_settlement_transaction_category_id,
  patch_organization_settlement_transaction_category_id,
]);
