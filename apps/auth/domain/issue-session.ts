import * as userRepo from "@/modules/user/user.repo";
import { type TokenPair, createSession } from "@/platform/auth";

/** user_id → profil snapshot’lı TokenPair. */
export async function issueSessionForUser(userId: string): Promise<TokenPair> {
  const user = await userRepo.findById(userId);
  return createSession(userId, null, {
    email: user?.email ?? null,
    first_name: user?.first_name ?? null,
    last_name: user?.last_name ?? null,
    picture: user?.picture ?? null,
  });
}
