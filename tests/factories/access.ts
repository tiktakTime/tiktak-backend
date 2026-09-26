import * as accessRepo from "@/modules/access/access.repo";
import { AccessStatus } from "@/modules/db";

type AccessInput = Parameters<typeof accessRepo.insert>[0];

/** Aktif üyelik. */
export async function makeAccess(overrides: AccessInput) {
  return accessRepo.insert({
    status: AccessStatus.active,
    ...overrides,
  });
}
