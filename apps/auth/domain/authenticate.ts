import { compare } from "bcryptjs";

import { AppError } from "@/core/errors";
import * as repo from "@/modules/user/user.repo";
import * as identityRepo from "@/modules/user_identity/user_identity.repo";

/** Validate credentials and return user id for session creation. */
export async function authenticateUser(email: string, password: string) {
  const user = await repo.findAuthByEmail(email.toLowerCase());

  if (!user || user.deleted_at) {
    throw new AppError("INVALID_CREDENTIALS");
  }
  if (user.status !== "active") {
    throw new AppError("USER_INACTIVE");
  }

  const identity = await identityRepo.findPasswordByUserId(user.id);
  if (!identity?.password_hash) {
    throw new AppError("INVALID_CREDENTIALS");
  }

  const ok = await compare(password, identity.password_hash);
  if (!ok) throw new AppError("INVALID_CREDENTIALS");

  await identityRepo.touchLastUsed(identity.id);
  await repo.touchLastLogin(user.id);

  return { id: user.id };
}
