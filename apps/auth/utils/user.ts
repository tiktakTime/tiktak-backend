import { AppError } from "@/core/errors";
import { UserStatus } from "@/modules/db";
import { User } from "@/modules/user/repo";

import { expired } from "./verification";

export async function requireUser(id: string) {
  const user = await User.findById(id);
  if (!user) throw new AppError("USER_NOT_FOUND");
  return user;
}

export async function assertEmailFree(
  email: string,
  userId?: string,
): Promise<void> {
  const asPrimary = await User.findByEmail(email);
  if (asPrimary && asPrimary.id !== userId) {
    throw new AppError("EMAIL_ALREADY_EXISTS");
  }
  const asRecovery = await User.findVerifiedRecovery(email, userId);
  if (asRecovery) throw new AppError("EMAIL_ALREADY_EXISTS");
}

export function assertCanSignIn(user: {
  status: UserStatus;
  expired_date: Date | string | null;
}): void {
  if (user.status !== UserStatus.active) throw new AppError("USER_INACTIVE");
  if (user.expired_date && expired(user.expired_date)) {
    throw new AppError("USER_INACTIVE");
  }
}

export async function assertRecoveryFree(
  recoveryEmail: string,
  userId: string,
  primaryEmail: string,
): Promise<void> {
  if (recoveryEmail === primaryEmail) {
    throw new AppError("RECOVERY_EMAIL_SAME_AS_PRIMARY");
  }
  await assertEmailFree(recoveryEmail, userId);
  const taken = await User.findVerifiedRecovery(recoveryEmail, userId);
  if (taken) throw new AppError("RECOVERY_EMAIL_ALREADY_EXISTS");
}
