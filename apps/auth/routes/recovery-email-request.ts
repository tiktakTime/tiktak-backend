import { z } from "@hono/zod-openapi";

import { defineRoute } from "@/core/http";
import { VerificationType } from "@/modules/db";
import { emailOf } from "@/modules/user/normalize";

import { sendAuthMail } from "../utils/mail";
import { authRequest } from "../utils/request";
import { AuthResult } from "../utils/response";
import { assertRecoveryFree, requireUser } from "../utils/user";
import { DAY, issueVerification } from "../utils/verification";

const Body = z
  .object({ recovery_email: z.email().max(255) })
  .openapi("RecoveryEmailRequestBody");

export const recoveryEmailRequestRoute = defineRoute({
  name: "auth.post.auth.recovery-email.request",
  method: "post",
  path: "/auth/recovery-email/request",
  tag: "auth",
  summary: "POST /auth/recovery-email/request",
  request: { body: Body },
  response: AuthResult,
  tenant: "none",
  handle: async ({ actorId, body, c }) => {
    const request = authRequest(c);
    const user = await requireUser(actorId);
    const email = emailOf(body.recovery_email);
    await assertRecoveryFree(email, user.id, user.email);
    const token = await issueVerification({
      userId: user.id,
      type: VerificationType.recovery_email_verify,
      target: email,
      ttlMs: DAY,
    });
    await sendAuthMail({
      key: "v2:accountRecovery",
      mail: email,
      userId: user.id,
      lastName: user.last_name,
      path: "/verify-recovery-email",
      token,
      request,
    });
    return null;
  },
});
