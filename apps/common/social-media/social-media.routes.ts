import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("CommonSocialMediaPending");

const post_social_media = defineRoute({
  name: "common.post.social-media",
  method: "post",
  path: "/social-media",
  tag: "common.social-media",
  summary: "POST /social-media",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const delete_social_media_id = defineRoute({
  name: "common.delete.social-media.id",
  method: "delete",
  path: "/social-media/{id}",
  tag: "common.social-media",
  summary: "DELETE /social-media/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_social_media_id = defineRoute({
  name: "common.get.social-media.id",
  method: "get",
  path: "/social-media/{id}",
  tag: "common.social-media",
  summary: "GET /social-media/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_social_media_id = defineRoute({
  name: "common.patch.social-media.id",
  method: "patch",
  path: "/social-media/{id}",
  tag: "common.social-media",
  summary: "PATCH /social-media/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_social_media_search = defineRoute({
  name: "common.get.social-media.search",
  method: "get",
  path: "/social-media/search",
  tag: "common.social-media",
  summary: "GET /social-media/search",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const commonSocialMediaRouter = createSlice([
  post_social_media,
  delete_social_media_id,
  get_social_media_id,
  patch_social_media_id,
  get_social_media_search,
]);
