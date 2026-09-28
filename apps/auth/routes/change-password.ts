import { z } from "@hono/zod-openapi";

import { hashPassword, passwordMatches } from "@/core/crypto";
import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { UserLogEvent } from "@/modules/db";
import { UserIdentity, UserLog } from "@/modules/user/repo";

import { AuthResult } from "../utils/response";

const Body = z
  .object({
    current_password: z.string().min(1).max(255),
    new_password: z.string().min(6).max(255),
  })
  .openapi("ChangePasswordBody");

export const changePasswordRoute = defineRoute({
  name: "auth.post.auth.change-password",
  method: "post",
  path: "/auth/change-password",
  tag: "auth",
  summary: "POST /auth/change-password",
  request: { body: Body },
  response: AuthResult,
  tenant: "none",
  handle: async ({ actorId, body }) => {
    const identity = await UserIdentity.findEmail(actorId);
    const ok = await passwordMatches(
      body.current_password,
      identity?.password ?? null,
    );
    if (!identity || !ok) throw new AppError("WRONG_CURRENT_PASSWORD");

    await UserIdentity.setPassword(
      actorId,
      await hashPassword(body.new_password),
    );
    await UserLog.insert({
      userId: actorId,
      event: UserLogEvent.password_changed,
    });
    return null;
  },
});
