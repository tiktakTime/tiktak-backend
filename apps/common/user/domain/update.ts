import { AppError } from "@/core/errors";
import * as repo from "@/modules/user/user.repo";

import type { UserUpdate } from "../user.schema";
import { assertSelfEmailChangeAllowed } from "./email-guard";

export async function updateUser(
  sessionUserId: string,
  id: string,
  input: UserUpdate,
) {
  assertSelfEmailChangeAllowed(sessionUserId, id, input.email);
  const row = await repo.update(id, {
    ...input,
    email_verified_at:
      input.email_verified_at === undefined
        ? undefined
        : input.email_verified_at
          ? new Date(input.email_verified_at)
          : null,
    phone_verified_at:
      input.phone_verified_at === undefined
        ? undefined
        : input.phone_verified_at
          ? new Date(input.phone_verified_at)
          : null,
    two_factor_enabled_at:
      input.two_factor_enabled_at === undefined
        ? undefined
        : input.two_factor_enabled_at
          ? new Date(input.two_factor_enabled_at)
          : null,
  });
  if (!row) throw new AppError("USER_NOT_FOUND");
  return row;
}
