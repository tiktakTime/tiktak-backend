import { z } from "@hono/zod-openapi";

export const SignInBodySchema = z
  .object({
    email: z.email().max(255),
    password: z.string().min(1).max(255),
  })
  .openapi("SignInBody");

export const SignUpBodySchema = z
  .object({
    first_name: z.string().trim().min(1).max(255),
    last_name: z.string().trim().min(1).max(255),
    email: z.email().max(255),
    password: z.string().min(6).max(255),
  })
  .openapi("SignUpBody");

const TokenFieldSchema = z.string().min(10).max(255);

export const VerifyEmailBodySchema = z
  .object({ token: TokenFieldSchema })
  .openapi("VerifyEmailBody");

export const ForgotPasswordBodySchema = z
  .object({ email: z.email().max(255) })
  .openapi("ForgotPasswordBody");

export const ResetPasswordBodySchema = z
  .object({
    token: TokenFieldSchema,
    new_password: z.string().min(6).max(255),
  })
  .openapi("ResetPasswordBody");

export const ChangePasswordBodySchema = z
  .object({
    current_password: z.string().min(1).max(255),
    new_password: z.string().min(6).max(255),
  })
  .openapi("ChangePasswordBody");

export const RecoveryEmailRequestBodySchema = z
  .object({ recovery_email: z.email().max(255) })
  .openapi("RecoveryEmailRequestBody");

export const RecoveryEmailVerifyBodySchema = z
  .object({ token: TokenFieldSchema })
  .openapi("RecoveryEmailVerifyBody");

export const ForgotPasswordRecoveryBodySchema = z
  .object({ recovery_email: z.email().max(255) })
  .openapi("ForgotPasswordRecoveryBody");

export const EmailChangeRequestBodySchema = z
  .object({ email: z.email().max(255) })
  .openapi("EmailChangeRequestBody");

export const EmailChangeVerifyBodySchema = z
  .object({ token: TokenFieldSchema })
  .openapi("EmailChangeVerifyBody");

export const SwitchParamSchema = z.object({ id: z.uuid() });

export const RefreshBodySchema = z
  .object({ refresh_token: z.string().min(1) })
  .openapi("RefreshBody");

export const OAuthBodySchema = z
  .object({
    provider: z.enum(["google", "apple"]),
    id_token: z.string().min(20),
    first_name: z.string().trim().max(255).optional(),
    last_name: z.string().trim().max(255).optional(),
  })
  .openapi("OAuthBody");

export const TokenPairSchema = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    token_type: z.literal("Bearer"),
    expires_in: z.number().int().positive(),
  })
  .openapi("TokenPair");

export const MemberSchema = z
  .object({
    user_id: z.uuid(),
    session_id: z.string(),
    organization_id: z.uuid().nullable().optional(),
    person_id: z.uuid().nullable().optional(),
    role_id: z.uuid().nullable().optional(),
    permissions: z.array(z.string()).optional(),
    email: z.string().nullable().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    picture: z.string().nullable().optional(),
  })
  .openapi("Member");

export const OkResponseSchema = z
  .object({ ok: z.boolean() })
  .openapi("OkResponse");
