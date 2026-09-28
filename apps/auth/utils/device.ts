import { sha256 } from "@/core/crypto";
import { env } from "@/core/env";
import { UserDevice } from "@/modules/user/repo";

import { clientIp, devicePlatform, type AuthRequest } from "./request";

export function openDevice(
  userId: string,
  refreshToken: string,
  request?: AuthRequest,
): Promise<string> {
  const platform = devicePlatform(request?.platform);
  return UserDevice.open({
    userId,
    installationId: request?.installationId?.trim() || platform,
    platform,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000),
    ip: clientIp(request?.ip),
  });
}
