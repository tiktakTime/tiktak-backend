import { randomUUID } from "node:crypto";

import { UserStatus } from "@/modules/db";
import * as userRepo from "@/modules/user/user.repo";

type UserInput = Parameters<typeof userRepo.insertUser>[0];

/** Aktif kullanıcı. E-posta verilmezse benzersizdir. */
export async function makeUser(overrides: UserInput = {}) {
  return userRepo.insertUser({
    email: `${randomUUID()}@example.test`,
    first_name: "Test",
    last_name: "User",
    status: UserStatus.active,
    ...overrides,
  });
}
