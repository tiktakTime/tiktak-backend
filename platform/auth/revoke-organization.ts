import { getRedis } from "@/core/redis";

import { userSessionsKey } from "./keys";
import { getSession, updateSessionFields } from "./session";

const ORG_CLEAR = {
  organization_id: null,
  permissions: [] as string[],
  person_id: null,
  role_id: null,
};

/**
 * Kullanıcının oturumlarında `organizationId` aktifse org bağlamını düşürür.
 * Tam logout yapmaz — başka org oturumlarına dokunmaz.
 */
export async function revokeOrganizationSessions(
  userId: string,
  organizationId: string,
): Promise<string[]> {
  if (!userId || !organizationId) return [];

  const redis = getRedis();
  const sids = await redis.smembers(userSessionsKey(userId));
  const cleared: string[] = [];

  for (const sid of sids) {
    const session = await getSession(sid);
    if (!session) {
      await redis.srem(userSessionsKey(userId), sid);
      continue;
    }
    if (session.organization_id !== organizationId) continue;

    try {
      await updateSessionFields(sid, ORG_CLEAR);
      cleared.push(sid);
    } catch (err) {
      console.error(
        `[session-revoke] ${sid} güncellenemedi:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return cleared;
}
