import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { UserStatus, VerificationType } from "@/modules/db";
import { User, UserIdentity, UserVerification } from "@/modules/user/repo";

import { AuthResult, tokenField } from "../utils/response";
import { requireUser } from "../utils/user";
import { expired, readToken } from "../utils/verification";

const Body = z
  .object({ token: tokenField })
  .openapi("VerifyEmailBody");

export const verifyEmailRoute = defineRoute({
  name: "auth.post.auth.verify-email",
  method: "post",
  path: "/auth/verify-email",
  tag: "auth",
  summary: "POST /auth/verify-email",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body }) => {
    const row = await readToken(VerificationType.email_verify, body.token);
    const user = await requireUser(row.user_id);

    if (row.consumed_at) {
      if (user.is_email_verified) return { user_id: user.id };
      throw new AppError("INVALID_TOKEN");
    }
    if (expired(row.expires_at)) throw new AppError("TOKEN_EXPIRED");

    await User.markEmailVerified(user.id, UserStatus.active);
    await UserIdentity.markEmailVerified(user.id);
    await UserVerification.consume(row.id);
    return { user_id: user.id };
  },
});
