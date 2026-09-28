import { defineRoute } from "@/core/http";
import { getSession } from "@/platform/auth";

import { AuthResult } from "../utils/response";
import { requireUser } from "../utils/user";

export const memberRoute = defineRoute({
  name: "auth.get.auth.member",
  method: "get",
  path: "/auth/member",
  tag: "auth",
  summary: "GET /auth/member",
  response: AuthResult,
  tenant: "none",
  handle: async ({ actorId, c }) => {
    const user = await requireUser(actorId);
    const session = await getSession(c.get("session_id") ?? "");
    return {
      user_id: user.id,
      session_id: c.get("session_id") ?? "",
      organization_id: session?.organization_id ?? null,
      person_id: session?.person_id ?? null,
      role_id: session?.role_id ?? null,
      permissions: session?.permissions ?? [],
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user.image,
    };
  },
});
