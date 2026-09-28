import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";

const Pending = z.object({}).passthrough().openapi("MobileUserPending");

const patch_user_id = defineRoute({
  name: "mobile.patch.user.id",
  method: "patch",
  path: "/user/{id}",
  tag: "mobile.user",
  summary: "PATCH /user/{id}",
  response: Result(Pending),
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});

export const mobileUserRouter = createSlice([patch_user_id]);
