import { z } from "@hono/zod-openapi";
import { compare, hash } from "bcryptjs";

import { AppError } from "@/core/errors";
import { Result, createSlice, defineRoute } from "@/core/http";
import { createRouter } from "@/core/router";
import { authMiddleware, rate_limit } from "@/middlewares";
import * as userRepo from "@/modules/user/user.repo";
import * as identityRepo from "@/modules/user_identity/user_identity.repo";
import { getSession, revokeSession, rotateRefreshToken } from "@/platform/auth";

import {
  ChangePasswordBodySchema,
  EmailChangeRequestBodySchema,
  EmailChangeVerifyBodySchema,
  ForgotPasswordBodySchema,
  ForgotPasswordRecoveryBodySchema,
  MemberSchema,
  OAuthBodySchema,
  OkResponseSchema,
  RecoveryEmailRequestBodySchema,
  RecoveryEmailVerifyBodySchema,
  RefreshBodySchema,
  ResetPasswordBodySchema,
  SignInBodySchema,
  SignUpBodySchema,
  SwitchParamSchema,
  TokenPairSchema,
  VerifyEmailBodySchema,
} from "./auth.schema";
import {
  authenticateUser,
  forgotPassword,
  forgotPasswordRecovery,
  issueSessionForUser,
  removeRecoveryEmail,
  requestEmailChange,
  requestEmailVerification,
  requestRecoveryEmail,
  resetPassword,
  resolveOAuthUser,
  signUpUser,
  switchOrganization,
  verifyEmail,
  verifyEmailChange,
  verifyOAuthIdToken,
  verifyRecoveryEmail,
} from "./domain";

const TAG = "auth";

const UserWithoutPasswordSchema = z
  .object({
    id: z.uuid(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    status: z.string(),
    created_at: z.date(),
  })
  .openapi("UserWithoutPassword");

function clientMeta(c: {
  req: { header: (name: string) => string | undefined };
}) {
  return {
    platform: c.req.header("x-platform") ?? c.req.header("platform"),
    ip: c.req.header("x-forwarded-for") ?? null,
    userAgent: c.req.header("user-agent") ?? null,
  };
}

function requireUserId(c: { get: (k: string) => unknown }): string {
  const userId = c.get("user_id");
  if (typeof userId !== "string" || !userId) {
    throw new AppError("MISSING_SESSION");
  }
  return userId;
}

function requireSession(c: { get: (k: string) => unknown }): {
  userId: string;
  sessionId: string;
} {
  const userId = c.get("user_id");
  const sessionId = c.get("session_id");
  if (typeof userId !== "string" || !userId) {
    throw new AppError("MISSING_SESSION");
  }
  if (typeof sessionId !== "string" || !sessionId) {
    throw new AppError("MISSING_SESSION");
  }
  return { userId, sessionId };
}

// ──────────────────────── Public ────────────────────────

const signIn = defineRoute({
  name: "auth.sign-in",
  method: "post",
  path: "/auth/sign-in",
  tag: TAG,
  summary: "Sign in with email and password",
  security: "none",
  request: { body: SignInBodySchema },
  response: Result(TokenPairSchema, "Token pair"),
  handle: async ({ body }) => {
    const user = await authenticateUser(body.email, body.password);
    return issueSessionForUser(user.id);
  },
});

const oauth = defineRoute({
  name: "auth.oauth",
  method: "post",
  path: "/auth/oauth",
  tag: TAG,
  summary: "Sign in with Google or Apple id_token",
  security: "none",
  request: { body: OAuthBodySchema },
  response: Result(TokenPairSchema, "Token pair"),
  handle: async ({ body }) => {
    let claims;
    try {
      claims = await verifyOAuthIdToken(body.provider, body.id_token);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("INVALID_TOKEN_AUTH");
    }
    const user = await resolveOAuthUser({
      provider: body.provider,
      claims,
      first_name: body.first_name,
      last_name: body.last_name,
    });
    return issueSessionForUser(user.id);
  },
});

const signUp = defineRoute({
  name: "auth.sign-up",
  method: "post",
  path: "/auth/sign-up",
  tag: TAG,
  summary: "Register a new user",
  security: "none",
  request: { body: SignUpBodySchema },
  response: Result(UserWithoutPasswordSchema, "Created user"),
  handle: ({ body, c }) =>
    signUpUser({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: body.password,
      meta: clientMeta(c),
    }),
});

const verifyEmailRoute = defineRoute({
  name: "auth.verify-email",
  method: "post",
  path: "/auth/verify-email",
  tag: TAG,
  summary: "Verify email with token",
  security: "none",
  request: { body: VerifyEmailBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body }) => {
    const data = await verifyEmail(body.token);
    return { ok: true, ...data };
  },
});

const forgotPasswordRoute = defineRoute({
  name: "auth.forgot-password",
  method: "post",
  path: "/auth/forgot-password",
  tag: TAG,
  summary: "Request password reset email",
  security: "none",
  request: { body: ForgotPasswordBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body, c }) => {
    await forgotPassword(body.email, clientMeta(c));
    return { ok: true };
  },
});

const resetPasswordRoute = defineRoute({
  name: "auth.reset-password",
  method: "post",
  path: "/auth/reset-password",
  tag: TAG,
  summary: "Reset password with token",
  security: "none",
  request: { body: ResetPasswordBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body }) => {
    await resetPassword(body.token, body.new_password);
    return { ok: true };
  },
});

const recoveryEmailVerify = defineRoute({
  name: "auth.recovery-email.verify",
  method: "post",
  path: "/auth/recovery-email/verify",
  tag: TAG,
  summary: "Verify recovery email with token",
  security: "none",
  request: { body: RecoveryEmailVerifyBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body }) => {
    await verifyRecoveryEmail(body.token);
    return { ok: true };
  },
});

const forgotPasswordRecoveryRoute = defineRoute({
  name: "auth.forgot-password-recovery",
  method: "post",
  path: "/auth/forgot-password-recovery",
  tag: TAG,
  summary: "Request password reset via recovery email",
  security: "none",
  request: { body: ForgotPasswordRecoveryBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body, c }) => {
    await forgotPasswordRecovery(body.recovery_email, clientMeta(c));
    return { ok: true };
  },
});

const emailChangeVerify = defineRoute({
  name: "auth.email-change.verify",
  method: "post",
  path: "/auth/email-change/verify",
  tag: TAG,
  summary: "Verify email change with token",
  security: "none",
  request: { body: EmailChangeVerifyBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body }) => {
    await verifyEmailChange(body.token);
    return { ok: true };
  },
});

const refresh = defineRoute({
  name: "auth.refresh",
  method: "post",
  path: "/auth/refresh",
  tag: TAG,
  summary: "Rotate refresh token",
  security: "none",
  request: { body: RefreshBodySchema },
  response: Result(TokenPairSchema, "New token pair"),
  handle: async ({ body }) => {
    try {
      return await rotateRefreshToken(body.refresh_token);
    } catch {
      throw new AppError("INVALID_REFRESH");
    }
  },
});

// ──────────────────────── Session (authMiddleware) ────────────────────────

const verifyEmailRequest = defineRoute({
  name: "auth.verify-email.request",
  method: "post",
  path: "/auth/verify-email/request",
  tag: TAG,
  summary: "Resend email verification link",
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ c }) => {
    await requestEmailVerification(requireUserId(c), clientMeta(c));
    return { ok: true };
  },
});

const changePassword = defineRoute({
  name: "auth.change-password",
  method: "post",
  path: "/auth/change-password",
  tag: TAG,
  summary: "Change password (authenticated)",
  request: { body: ChangePasswordBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body, c }) => {
    const userId = requireUserId(c);
    const identity = await identityRepo.findPasswordByUserId(userId);
    if (!identity?.password_hash) {
      throw new AppError("INVALID_CREDENTIALS");
    }
    const ok = await compare(body.current_password, identity.password_hash);
    if (!ok) throw new AppError("WRONG_CURRENT_PASSWORD");
    await userRepo.updatePassword(userId, await hash(body.new_password, 10));
    return { ok: true };
  },
});

const recoveryEmailRequest = defineRoute({
  name: "auth.recovery-email.request",
  method: "post",
  path: "/auth/recovery-email/request",
  tag: TAG,
  summary: "Set recovery email (authenticated)",
  request: { body: RecoveryEmailRequestBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body, c }) => {
    await requestRecoveryEmail(
      requireUserId(c),
      body.recovery_email,
      clientMeta(c),
    );
    return { ok: true };
  },
});

const recoveryEmailRemove = defineRoute({
  name: "auth.recovery-email.remove",
  method: "delete",
  path: "/auth/recovery-email",
  tag: TAG,
  summary: "Remove recovery email (authenticated)",
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ c }) => {
    await removeRecoveryEmail(requireUserId(c));
    return { ok: true };
  },
});

const emailChangeRequest = defineRoute({
  name: "auth.email-change.request",
  method: "post",
  path: "/auth/email-change/request",
  tag: TAG,
  summary: "Request email change (authenticated)",
  request: { body: EmailChangeRequestBodySchema },
  response: Result(OkResponseSchema, "OK"),
  handle: async ({ body, c }) => {
    await requestEmailChange(requireUserId(c), body.email, clientMeta(c));
    return { ok: true };
  },
});

const logout = defineRoute({
  name: "auth.logout",
  method: "post",
  path: "/auth/logout",
  tag: TAG,
  summary: "Revoke current session",
  response: Result(z.null(), "Logged out"),
  handle: async ({ c }) => {
    const sid = c.get("session_id");
    if (!sid) throw new AppError("MISSING_SESSION");
    await revokeSession(sid);
    return null;
  },
});

const member = defineRoute({
  name: "auth.member",
  method: "get",
  path: "/auth/member",
  tag: TAG,
  summary: "Get current member information",
  response: Result(MemberSchema, "Member info"),
  handle: async ({ c }) => {
    const { userId, sessionId } = requireSession(c);
    const session = await getSession(sessionId);
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError("USER_NOT_FOUND");

    return {
      user_id: user.id,
      session_id: sessionId,
      organization_id: c.get("organization_id") ?? null,
      person_id: c.get("person_id") ?? null,
      role_id: c.get("role_id") ?? null,
      permissions: c.get("permissions") ?? [],
      email: session?.email ?? user.email ?? undefined,
      first_name: session?.first_name ?? user.first_name,
      last_name: session?.last_name ?? user.last_name,
      picture: session?.picture ?? user.picture ?? null,
    };
  },
});

const switchOrg = defineRoute({
  name: "auth.switch",
  method: "get",
  path: "/auth/switch/{id}",
  tag: TAG,
  summary: "Switch organization",
  request: { params: SwitchParamSchema },
  response: Result(MemberSchema, "Switched"),
  handle: async ({ params, c }) => {
    const { userId, sessionId } = requireSession(c);
    const memberData = await switchOrganization({
      userId,
      sessionId,
      organizationId: params.id,
    });

    c.set("organization_id", params.id);
    c.set("person_id", memberData.person_id);
    c.set("role_id", memberData.role_id);
    c.set("permissions", memberData.permissions);

    return memberData;
  },
});

const authRoutes = createSlice([
  signIn,
  oauth,
  signUp,
  verifyEmailRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  recoveryEmailVerify,
  forgotPasswordRecoveryRoute,
  emailChangeVerify,
  refresh,
  verifyEmailRequest,
  changePassword,
  recoveryEmailRequest,
  recoveryEmailRemove,
  emailChangeRequest,
  logout,
  member,
  switchOrg,
]);

/**
 * Auth yüzeyi — rate-limit + session middleware path bazlı;
 * route sözleşmesi `defineRoute` / `createSlice`.
 */
export const authRouter = createRouter();

authRouter.use("/auth/sign-in", rate_limit.auth);
authRouter.use("/auth/oauth", rate_limit.auth);
authRouter.use("/auth/refresh", rate_limit.auth);

authRouter.use("/auth/verify-email/request", authMiddleware);
authRouter.use("/auth/change-password", authMiddleware);
authRouter.use("/auth/recovery-email/request", authMiddleware);
authRouter.use("/auth/recovery-email", authMiddleware);
authRouter.use("/auth/email-change/request", authMiddleware);
authRouter.use("/auth/logout", authMiddleware);
authRouter.use("/auth/member", authMiddleware);
authRouter.use("/auth/switch/:id", authMiddleware);

authRouter.route("/", authRoutes);
