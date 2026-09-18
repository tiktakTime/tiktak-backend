import { verifyJwt } from "@/core/crypto";

import type { AccessClaims } from "./claims";
import { getSession } from "./session";

/** Access JWT’yi doğrula ve aktif oturum claim’lerini döndür. */
export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const payload = await verifyJwt(token);

  const sub = payload.sub;
  const sid = typeof payload.sid === "string" ? payload.sid : undefined;
  const jti = typeof payload.jti === "string" ? payload.jti : undefined;

  if (!sub || !sid || !jti) {
    throw new Error("Invalid access token claims");
  }

  const session = await getSession(sid);
  if (!session || session.user_id !== sub) {
    throw new Error("Session not found or revoked");
  }

  return { sub, sid, jti };
}
