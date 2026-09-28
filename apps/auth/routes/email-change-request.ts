import { z } from "@hono/zod-openapi";

import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { VerificationType } from "@/modules/db";
import { emailOf } from "@/modules/user/normalize";

import { sendAuthMail } from "../utils/mail";
import { authRequest } from "../utils/request";
import { AuthResult } from "../utils/response";
import { assertEmailFree, requireUser } from "../utils/user";
import { DAY, issueVerification } from "../utils/verification";

const Body = z
  .object({ email: z.email().max(255) })
  .openapi("EmailChangeRequestBody");

export const emailChangeRequestRoute = defineRoute({
  name: "auth.post.auth.email-change.request",
  method: "post",
  path: "/auth/email-change/request",
  tag: "auth",
  summary: "POST /auth/email-change/request",
  request: { body: Body },
  response: AuthResult,
  tenant: "none",
  handle: async ({ actorId, body, c }) => {
    const request = authRequest(c);
    const user = await requireUser(actorId);
    const email = emailOf(body.email);
    if (email === user.email && user.is_email_verified) {
      throw new AppError("EMAIL_UNCHANGED");
    }
    if (user.is_recovery_email_verified && user.recovery_email === email) {
      throw new AppError("EMAIL_ALREADY_EXISTS");
    }
    await assertEmailFree(email, user.id);

    const token = await issueVerification({
      userId: user.id,
      type: VerificationType.email_change,
      target: email,
      ttlMs: DAY,
    });
    await sendAuthMail({
      key: "v2:emailChange",
      mail: email,
      userId: user.id,
      lastName: user.last_name,
      path: "/verify-email-change",
      token,
      request,
    });
    return null;
  },
});
