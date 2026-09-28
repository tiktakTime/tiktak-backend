import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { VerificationType } from "@/modules/db";
import { emailOf } from "@/modules/user/normalize";
import { User } from "@/modules/user/repo";

import { sendAuthMail } from "../utils/mail";
import { authRequest } from "../utils/request";
import { AuthResult } from "../utils/response";
import { HOUR, issueVerification } from "../utils/verification";

const Body = z
  .object({ recovery_email: z.email().max(255) })
  .openapi("ForgotPasswordRecoveryBody");

export const forgotPasswordRecoveryRoute = defineRoute({
  name: "auth.post.auth.forgot-password-recovery",
  method: "post",
  path: "/auth/forgot-password-recovery",
  tag: "auth",
  summary: "POST /auth/forgot-password-recovery",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body, c }) => {
    const request = authRequest(c);
    const email = emailOf(body.recovery_email);
    const user = await User.findVerifiedRecovery(email);
    if (!user) throw new AppError("USER_NOT_FOUND");

    const token = await issueVerification({
      userId: user.id,
      type: VerificationType.password_reset,
      target: email,
      ttlMs: HOUR,
    });
    await sendAuthMail({
      key: "v2:passwordRecovery",
      mail: email,
      userId: user.id,
      lastName: user.last_name,
      path: "/change-password",
      token,
      request,
    });
    return null;
  },
});
