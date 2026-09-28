import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";

import { AuthResult } from "../utils/response";

export const switchRoute = defineRoute({
  name: "auth.get.auth.switch.id",
  method: "get",
  path: "/auth/switch/{id}",
  tag: "auth",
  summary: "GET /auth/switch/{id}",
  response: AuthResult,
  tenant: "none",
  handle: () => {
    throw new AppError("NOT_IMPLEMENTED");
  },
});
