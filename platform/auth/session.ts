import { newId, randomToken, sha256, signJwt } from "@/core/crypto";
import { env } from "@/core/env";
import { getRedis } from "@/core/redis";

import type {
  SessionOrgFields,
  SessionRecord,
  SessionUserSnapshot,
  TokenPair,
} from "./claims";
import { refreshKey, sessionKey, userSessionsKey } from "./keys";

/** Redis’ten oturum kaydını oku. */
export async function getSession(sid: string): Promise<SessionRecord | null> {
  const raw = await getRedis().get(sessionKey(sid));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionRecord;
  } catch {
    return null;
  }
}

/** Kullanıcı ve oturum için imzalı access JWT üret. */
export async function issueAccessToken(claims: {
  sub: string;
  sid: string;
}): Promise<string> {
  const jti = newId();
  return signJwt(
    { sub: claims.sub, sid: claims.sid, jti },
    env.ACCESS_TOKEN_TTL_SECONDS,
  );
}

/** Yeni oturum aç ve access/refresh token çifti döndür. */
export async function createSession(
  userId: string,
  orgFields?: SessionOrgFields | string | null,
  userSnapshot?: SessionUserSnapshot,
): Promise<TokenPair> {
  const fields: SessionOrgFields =
    typeof orgFields === "string" || orgFields == null
      ? { organization_id: orgFields ?? null }
      : orgFields;

  const sid = newId();
  const refresh_token = randomToken(32);
  const refresh_hash = sha256(refresh_token);
  const now = Date.now();
  const ttlMs = env.REFRESH_TOKEN_TTL_SECONDS * 1000;
  const record: SessionRecord = {
    user_id: userId,
    organization_id: fields.organization_id ?? null,
    permissions: fields.permissions ?? [],
    person_id: fields.person_id ?? null,
    role_id: fields.role_id ?? null,
    is_super_admin: fields.is_super_admin ?? false,
    email: userSnapshot?.email ?? null,
    first_name: userSnapshot?.first_name ?? null,
    last_name: userSnapshot?.last_name ?? null,
    picture: userSnapshot?.picture ?? null,
    refresh_hash,
    created_at: now,
    expires_at: now + ttlMs,
  };

  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(sessionKey(sid), JSON.stringify(record), "PX", ttlMs);
  pipeline.set(refreshKey(refresh_hash), sid, "PX", ttlMs);
  pipeline.sadd(userSessionsKey(userId), sid);
  pipeline.pexpire(userSessionsKey(userId), ttlMs);
  await pipeline.exec();

  const access_token = await issueAccessToken({ sub: userId, sid });

  return {
    access_token,
    refresh_token,
    token_type: "Bearer",
    expires_in: env.ACCESS_TOKEN_TTL_SECONDS,
  };
}

/** Refresh token’ı doğrula, eski oturumu kapatıp yenisini üret. */
export async function rotateRefreshToken(
  refreshToken: string,
): Promise<TokenPair> {
  const redis = getRedis();
  const hash = sha256(refreshToken);
  // GETDEL tek kazanan bırakır. İki eşzamanlı rotate aynı token'ı ikisi de
  // geçerli saymasın.
  const sid = await redis.getdel(refreshKey(hash));
  if (!sid) throw new Error("Invalid refresh token");

  const session = await getSession(sid);
  if (!session || session.refresh_hash !== hash) {
    if (sid) await revokeSession(sid);
    throw new Error("Refresh token replay or mismatch");
  }

  await revokeSession(sid);
  return createSession(
    session.user_id,
    {
      organization_id: session.organization_id,
      permissions: session.permissions,
      person_id: session.person_id,
      role_id: session.role_id,
      is_super_admin: session.is_super_admin,
    },
    {
      email: session.email,
      first_name: session.first_name,
      last_name: session.last_name,
      picture: session.picture,
    },
  );
}

/** Oturumdaki aktif organizasyonu güncelle (auth switch). */
export async function updateSessionOrganization(
  sid: string,
  organizationId: string | null,
): Promise<SessionRecord> {
  return updateSessionFields(sid, { organization_id: organizationId });
}

/** Oturum alanlarını kısmi güncelle. */
export async function updateSessionFields(
  sid: string,
  fields: SessionOrgFields,
): Promise<SessionRecord> {
  const session = await getSession(sid);
  if (!session) throw new Error("Session not found");

  const ttlMs = Math.max(1, session.expires_at - Date.now());
  const next: SessionRecord = {
    ...session,
    ...fields,
  };
  await getRedis().set(sessionKey(sid), JSON.stringify(next), "PX", ttlMs);
  return next;
}

/** Oturumu ve bağlı refresh anahtarını Redis’ten sil. */
export async function revokeSession(sid: string): Promise<void> {
  const redis = getRedis();
  const session = await getSession(sid);
  const pipeline = redis.pipeline();
  pipeline.del(sessionKey(sid));
  if (session?.refresh_hash) {
    pipeline.del(refreshKey(session.refresh_hash));
  }
  if (session?.user_id) {
    pipeline.srem(userSessionsKey(session.user_id), sid);
  }
  await pipeline.exec();
}
