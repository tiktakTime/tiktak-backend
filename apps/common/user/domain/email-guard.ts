import { AppError } from "@/core/errors";

/** Session user cannot change own email via profile update. */
export function assertSelfEmailChangeAllowed(
  sessionUserId: string,
  targetId: string,
  email: string | undefined,
) {
  if (sessionUserId === targetId && email !== undefined) {
    throw new AppError("EMAIL_CHANGE_REQUIRES_VERIFICATION");
  }
}
