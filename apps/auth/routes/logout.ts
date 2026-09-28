import { defineRoute } from "@/core/http";
import { UserLogEvent } from "@/modules/db";
import { UserDevice, UserLog } from "@/modules/user/repo";
import { getSession, revokeSession } from "@/platform/auth";

import { authRequest, clientIp } from "../utils/request";
import { AuthResult } from "../utils/response";

export const logoutRoute = defineRoute({
  name: "auth.post.auth.logout",
  method: "post",
  path: "/auth/logout",
  tag: "auth",
  summary: "POST /auth/logout",
  response: AuthResult,
  tenant: "none",
  handle: async ({ actorId, c }) => {
    const request = authRequest(c);
    const sessionId = c.get("session_id") ?? "";
    const session = await getSession(sessionId);
    await revokeSession(sessionId);
    if (session?.refresh_hash) {
      await UserDevice.clearToken(actorId, session.refresh_hash);
    }
    await UserLog.insert({
      userId: actorId,
      event: UserLogEvent.logout,
      ip: clientIp(request.ip),
      userAgent: request.userAgent,
    });
    return null;
  },
});
