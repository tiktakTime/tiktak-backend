import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { VerificationType } from "@/modules/db";
import { emailOf } from "@/modules/user/normalize";
import { User, UserVerification } from "@/modules/user/repo";

import { AuthResult, tokenField } from "../utils/response";
import { assertRecoveryFree, requireUser } from "../utils/user";
import { expired, readToken } from "../utils/verification";

const Body = z
  .object({ token: tokenField })
  .openapi("RecoveryEmailVerifyBody");

export const recoveryEmailVerifyRoute = defineRoute({
  name: "auth.post.auth.recovery-email.verify",
  method: "post",
  path: "/auth/recovery-email/verify",
  tag: "auth",
  summary: "POST /auth/recovery-email/verify",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body }) => {
    const row = await readToken(
      VerificationType.recovery_email_verify,
      body.token,
    );
    const user = await requireUser(row.user_id);
    const recoveryEmail = emailOf(row.target);

    if (row.consumed_at) {
      if (
        user.is_recovery_email_verified &&
        user.recovery_email === recoveryEmail
      ) {
        return { user_id: user.id, recovery_email: recoveryEmail };
      }
      throw new AppError("INVALID_TOKEN");
    }
    if (expired(row.expires_at)) throw new AppError("TOKEN_EXPIRED");

    await assertRecoveryFree(recoveryEmail, user.id, user.email);
    await User.setRecovery(user.id, recoveryEmail);
    await UserVerification.consume(row.id);
    return { user_id: user.id, recovery_email: recoveryEmail };
  },
});
