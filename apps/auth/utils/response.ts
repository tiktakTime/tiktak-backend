import { z } from "@hono/zod-openapi";

import { Result } from "@/core/http";

export const AuthPending = z
  .object({})
  .passthrough()
  .openapi("AuthAuthPending");

export const AuthResult = Result(AuthPending);

export const tokenField = z.string().min(10).max(255);
