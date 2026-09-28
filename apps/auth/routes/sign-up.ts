import { z } from "@hono/zod-openapi";

import { hashPassword } from "@/core/crypto";
import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { UserLogEvent, VerificationType } from "@/modules/db";
import { emailOf, fullName } from "@/modules/user/normalize";
import { User, UserIdentity, UserLog } from "@/modules/user/repo";

import { sendAuthMail } from "../utils/mail";
import { authRequest, clientIp } from "../utils/request";
import { AuthResult } from "../utils/response";
import { DAY, issueVerification } from "../utils/verification";

const Body = z
  .object({
    first_name: z.string().trim().min(1).max(255),
    last_name: z.string().trim().min(1).max(255),
    email: z.email().max(255),
    password: z.string().min(6).max(255),
  })
  .openapi("SignUpBody");

export const signUpRoute = defineRoute({
  name: "auth.post.auth.sign-up",
  method: "post",
  path: "/auth/sign-up",
  tag: "auth",
  summary: "POST /auth/sign-up",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body, c }) => {
    const request = authRequest(c);
    const email = emailOf(body.email);
    const firstName = body.first_name.trim();
    const lastName = body.last_name.trim();
    if (await User.findByEmail(email)) {
      throw new AppError("EMAIL_ALREADY_EXISTS");
    }

    const user = await User.insert({
      firstName,
      lastName,
      fullName: fullName(firstName, lastName),
      email,
    });
    await UserIdentity.insertEmail({
      userId: user.id,
      email,
      password: await hashPassword(body.password),
    });

    const token = await issueVerification({
      userId: user.id,
      type: VerificationType.email_verify,
      target: email,
      ttlMs: DAY,
    });
    await sendAuthMail({
      key: "v2:verifyEmail",
      mail: email,
      userId: user.id,
      lastName,
      path: "/verify-email",
      token,
      request,
    });
    await UserLog.insert({
      userId: user.id,
      event: UserLogEvent.register,
      ip: clientIp(request.ip),
      userAgent: request.userAgent,
    });
    return { id: user.id };
  },
});
