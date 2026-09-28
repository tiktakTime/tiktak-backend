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
  .object({ email: z.email().max(255) })
  .openapi("ForgotPasswordBody");

export const forgotPasswordRoute = defineRoute({
  name: "auth.post.auth.forgot-password",
  method: "post",
  path: "/auth/forgot-password",
  tag: "auth",
  summary: "POST /auth/forgot-password",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body, c }) => {
    const request = authRequest(c);
    const user = await User.findByEmail(emailOf(body.email));
    if (!user) throw new AppError("USER_NOT_FOUND");
    const token = await issueVerification({
      userId: user.id,
      type: VerificationType.password_reset,
      target: user.email,
      ttlMs: HOUR,
    });
    await sendAuthMail({
      key: "v2:passwordRecovery",
      mail: user.email,
      userId: user.id,
      lastName: user.last_name,
      path: "/change-password",
      token,
      request,
    });
    return null;
  },
});
