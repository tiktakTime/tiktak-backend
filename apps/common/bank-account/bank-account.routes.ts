import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("CommonBankAccountPending");

const post_bank_account = defineRoute({
  name: "common.post.bank-account",
  method: "post",
  path: "/bank-account",
  tag: "common.bank-account",
  summary: "POST /bank-account",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_bank_account_id = defineRoute({
  name: "common.delete.bank-account.id",
  method: "delete",
  path: "/bank-account/{id}",
  tag: "common.bank-account",
  summary: "DELETE /bank-account/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_bank_account_id = defineRoute({
  name: "common.get.bank-account.id",
  method: "get",
  path: "/bank-account/{id}",
  tag: "common.bank-account",
  summary: "GET /bank-account/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_bank_account_id = defineRoute({
  name: "common.patch.bank-account.id",
  method: "patch",
  path: "/bank-account/{id}",
  tag: "common.bank-account",
  summary: "PATCH /bank-account/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_bank_account_search = defineRoute({
  name: "common.get.bank-account.search",
  method: "get",
  path: "/bank-account/search",
  tag: "common.bank-account",
  summary: "GET /bank-account/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const commonBankAccountRouter = createSlice([
  post_bank_account,
  delete_bank_account_id,
  get_bank_account_id,
  patch_bank_account_id,
  get_bank_account_search,
]);
