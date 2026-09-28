import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("Public.invitePending");

const get_invite_by_token = defineRoute({
  name: "public.get.invite.by-token",
  method: "get",
  path: "/invite/by-token",
  tag: "public.invite",
  summary: "GET /invite/by-token",
  response: Result(Pending),
  security: "none",
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

const post_invite_accept = defineRoute({
  name: "public.post.invite.accept",
  method: "post",
  path: "/invite/accept",
  tag: "public.invite",
  summary: "POST /invite/accept",
  response: Result(Pending),
  security: "none",
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const publicInviteRouter = createSlice([
  get_invite_by_token,
  post_invite_accept,
]);
