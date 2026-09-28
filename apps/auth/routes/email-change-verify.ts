import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { UserLogEvent, UserStatus, VerificationType } from "@/modules/db";
import { emailOf } from "@/modules/user/normalize";
import { User, UserIdentity, UserLog, UserVerification } from "@/modules/user/repo";

import { AuthResult, tokenField } from "../utils/response";
import { assertEmailFree, requireUser } from "../utils/user";
import { expired, readToken } from "../utils/verification";

const Body = z
  .object({ token: tokenField })
  .openapi("EmailChangeVerifyBody");

export const emailChangeVerifyRoute = defineRoute({
  name: "auth.post.auth.email-change.verify",
  method: "post",
  path: "/auth/email-change/verify",
  tag: "auth",
  summary: "POST /auth/email-change/verify",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body }) => {
    const row = await readToken(VerificationType.email_change, body.token);
    const user = await requireUser(row.user_id);
    const email = emailOf(row.target);

    if (row.consumed_at) {
      if (user.email === email) return { user_id: user.id, email };
      throw new AppError("INVALID_TOKEN");
    }
    if (expired(row.expires_at)) throw new AppError("TOKEN_EXPIRED");
    if (user.email === email && user.is_email_verified) {
      await UserVerification.consume(row.id);
      return { user_id: user.id, email };
    }

    if (user.is_recovery_email_verified && user.recovery_email === email) {
      throw new AppError("EMAIL_ALREADY_EXISTS");
    }
    await assertEmailFree(email, user.id);

    const activate =
      !user.is_email_verified && user.status === UserStatus.inactive;
    await User.changeEmail(
      user.id,
      email,
      activate ? UserStatus.active : undefined,
    );
    await UserIdentity.setEmail(user.id, email);
    await UserVerification.consume(row.id);
    await UserLog.insert({
      userId: user.id,
      event: UserLogEvent.email_changed,
      metadata: { email },
    });
    return { user_id: user.id, email };
  },
});
