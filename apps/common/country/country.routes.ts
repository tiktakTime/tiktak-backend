import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("CommonCountryPending");

const delete_country_id = defineRoute({
  name: "common.delete.country.id",
  method: "delete",
  path: "/country/{id}",
  tag: "common.country",
  summary: "DELETE /country/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_country_id = defineRoute({
  name: "common.get.country.id",
  method: "get",
  path: "/country/{id}",
  tag: "common.country",
  summary: "GET /country/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_country_id = defineRoute({
  name: "common.patch.country.id",
  method: "patch",
  path: "/country/{id}",
  tag: "common.country",
  summary: "PATCH /country/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_country_search = defineRoute({
  name: "common.get.country.search",
  method: "get",
  path: "/country/search",
  tag: "common.country",
  summary: "GET /country/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const commonCountryRouter = createSlice([
  delete_country_id,
  get_country_id,
  patch_country_id,
  get_country_search,
]);
