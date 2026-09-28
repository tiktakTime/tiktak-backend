import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Web.userPending");

const patch_user_id = defineRoute({
  name: "web.patch.user.id",
  method: "patch",
  path: "/user/{id}",
  tag: "web.user",
  summary: "PATCH /user/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const get_user_settings_me = defineRoute({
  name: "web.get.user.settings.me",
  method: "get",
  path: "/user/settings/me",
  tag: "web.user",
  summary: "GET /user/settings/me",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const patch_user_settings_me = defineRoute({
  name: "web.patch.user.settings.me",
  method: "patch",
  path: "/user/settings/me",
  tag: "web.user",
  summary: "PATCH /user/settings/me",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const webUserRouter = createSlice([
  patch_user_id,
  get_user_settings_me,
  patch_user_settings_me,
]);
