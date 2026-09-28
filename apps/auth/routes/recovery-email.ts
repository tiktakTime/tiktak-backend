import { defineRoute } from "@/core/http";
import { User } from "@/modules/user/repo";

import { AuthResult } from "../utils/response";
import { requireUser } from "../utils/user";

export const recoveryEmailDeleteRoute = defineRoute({
  name: "auth.delete.auth.recovery-email",
  method: "delete",
  path: "/auth/recovery-email",
  tag: "auth",
  summary: "DELETE /auth/recovery-email",
  response: AuthResult,
  tenant: "none",
  handle: async ({ actorId }) => {
    await requireUser(actorId);
    await User.clearRecovery(actorId);
    return null;
  },
});
