import { z } from "@hono/zod-openapi";

import { hashPassword } from "@/core/crypto";
import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { UserLogEvent, VerificationType } from "@/modules/db";
import { UserIdentity, UserLog, UserVerification } from "@/modules/user/repo";
import { sendEmail } from "@/platform/notifications";

import { AuthResult, tokenField } from "../utils/response";
import { requireUser } from "../utils/user";
import { expired, readToken } from "../utils/verification";

const Body = z
  .object({
    token: tokenField,
    new_password: z.string().min(6).max(255),
  })
  .openapi("ResetPasswordBody");

export const resetPasswordRoute = defineRoute({
  name: "auth.post.auth.reset-password",
  method: "post",
  path: "/auth/reset-password",
  tag: "auth",
  summary: "POST /auth/reset-password",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body }) => {
    const row = await readToken(VerificationType.password_reset, body.token);
    if (row.consumed_at) throw new AppError("INVALID_TOKEN");
    if (expired(row.expires_at)) throw new AppError("TOKEN_EXPIRED");
    const user = await requireUser(row.user_id);

    await UserIdentity.setPassword(
      user.id,
      await hashPassword(body.new_password),
    );
    await UserVerification.consume(row.id);
    await UserLog.insert({
      userId: user.id,
      event: UserLogEvent.password_reset,
    });
    try {
      await sendEmail({
        key: "v2:passwordChanged",
        mail: user.email,
        userId: user.id,
        payload: { lastName: user.last_name },
      });
    } catch (error) {
      console.error("[auth] e-posta gönderilemedi:", error);
    }
    return null;
  },
});
