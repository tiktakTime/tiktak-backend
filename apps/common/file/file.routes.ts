import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("CommonFilePending");

const get_files = defineRoute({
  name: "common.get.files",
  method: "get",
  path: "/files",
  tag: "common.file",
  summary: "GET /files",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_files = defineRoute({
  name: "common.post.files",
  method: "post",
  path: "/files",
  tag: "common.file",
  summary: "POST /files",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_files_id = defineRoute({
  name: "common.delete.files.id",
  method: "delete",
  path: "/files/{id}",
  tag: "common.file",
  summary: "DELETE /files/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_files_id = defineRoute({
  name: "common.get.files.id",
  method: "get",
  path: "/files/{id}",
  tag: "common.file",
  summary: "GET /files/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_files_id = defineRoute({
  name: "common.patch.files.id",
  method: "patch",
  path: "/files/{id}",
  tag: "common.file",
  summary: "PATCH /files/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const commonFileRouter = createSlice([
  get_files,
  post_files,
  delete_files_id,
  get_files_id,
  patch_files_id,
]);
