import { defineRoute } from "@/core/http";
import { VerificationType } from "@/modules/db";

import { sendAuthMail } from "../utils/mail";
import { authRequest } from "../utils/request";
import { AuthResult } from "../utils/response";
import { requireUser } from "../utils/user";
import { DAY, issueVerification } from "../utils/verification";

export const verifyEmailRequestRoute = defineRoute({
  name: "auth.post.auth.verify-email.request",
  method: "post",
  path: "/auth/verify-email/request",
  tag: "auth",
  summary: "POST /auth/verify-email/request",
  response: AuthResult,
  tenant: "none",
  handle: async ({ actorId, c }) => {
    const request = authRequest(c);
    const user = await requireUser(actorId);
    if (user.is_email_verified) return null;

    const token = await issueVerification({
      userId: user.id,
      type: VerificationType.email_verify,
      target: user.email,
      ttlMs: DAY,
    });
    await sendAuthMail({
      key: "v2:verifyEmail",
      mail: user.email,
      userId: user.id,
      lastName: user.last_name,
      path: "/verify-email",
      token,
      request,
    });
    return null;
  },
});
