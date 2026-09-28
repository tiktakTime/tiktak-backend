import { z } from "@hono/zod-openapi";

import { passwordMatches } from "@/core/crypto";
import { AppError } from "@/core/errors";
import { defineRoute } from "@/core/http";
import { UserLogEvent } from "@/modules/db";
import { emailOf } from "@/modules/user/normalize";
import { User, UserIdentity, UserLog } from "@/modules/user/repo";
import { createSession } from "@/platform/auth";

import { openDevice } from "../utils/device";
import { authRequest, clientIp } from "../utils/request";
import { AuthResult } from "../utils/response";
import { assertCanSignIn } from "../utils/user";

const Body = z
  .object({
    email: z.email().max(255),
    password: z.string().min(1).max(255),
  })
  .openapi("SignInBody");

export const signInRoute = defineRoute({
  name: "auth.post.auth.sign-in",
  method: "post",
  path: "/auth/sign-in",
  tag: "auth",
  summary: "POST /auth/sign-in",
  request: { body: Body },
  response: AuthResult,
  security: "none",
  tenant: "none",
  handle: async ({ body, c }) => {
    const request = authRequest(c);
    const email = emailOf(body.email);
    const user = await User.findByEmail(email);
    if (!user) {
      await UserLog.insert({
        event: UserLogEvent.login_failed,
        ip: clientIp(request.ip),
        userAgent: request.userAgent,
        metadata: { email },
      });
      throw new AppError("USER_NOT_FOUND");
    }

    try {
      assertCanSignIn(user);
    } catch (error) {
      await UserLog.insert({
        userId: user.id,
        event: UserLogEvent.login_failed,
        ip: clientIp(request.ip),
        userAgent: request.userAgent,
      });
      throw error;
    }

    const identity = await UserIdentity.findEmail(user.id);
    const ok = await passwordMatches(body.password, identity?.password ?? null);
    if (!ok) {
      await UserLog.insert({
        userId: user.id,
        event: UserLogEvent.login_failed,
        ip: clientIp(request.ip),
        userAgent: request.userAgent,
      });
      throw new AppError("INVALID_CREDENTIALS");
    }

    const pair = await createSession(user.id, null, {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user.image,
    });
    const deviceId = await openDevice(user.id, pair.refresh_token, request);
    await User.touchLogin(user.id);
    await UserIdentity.touchUsed(user.id);
    await UserLog.insert({
      userId: user.id,
      deviceId,
      event: UserLogEvent.login_success,
      ip: clientIp(request.ip),
      userAgent: request.userAgent,
    });
    return pair;
  },
});
