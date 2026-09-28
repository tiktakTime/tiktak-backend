import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("CommonAddressPending");

const post_address = defineRoute({
  name: "common.post.address",
  method: "post",
  path: "/address",
  tag: "common.address",
  summary: "POST /address",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_address_id = defineRoute({
  name: "common.delete.address.id",
  method: "delete",
  path: "/address/{id}",
  tag: "common.address",
  summary: "DELETE /address/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_address_id = defineRoute({
  name: "common.get.address.id",
  method: "get",
  path: "/address/{id}",
  tag: "common.address",
  summary: "GET /address/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_address_id = defineRoute({
  name: "common.patch.address.id",
  method: "patch",
  path: "/address/{id}",
  tag: "common.address",
  summary: "PATCH /address/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_address_search = defineRoute({
  name: "common.get.address.search",
  method: "get",
  path: "/address/search",
  tag: "common.address",
  summary: "GET /address/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const commonAddressRouter = createSlice([
  post_address,
  delete_address_id,
  get_address_id,
  patch_address_id,
  get_address_search,
]);
