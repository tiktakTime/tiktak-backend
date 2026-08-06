import {
  type JWTPayload,
  createRemoteJWKSet,
  jwtVerify,
} from "jose";

import type { User } from "@tiktak/database";
import { env } from "@tiktak/env";

export interface FirebaseJWTPayload extends JWTPayload {
  uid?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  phone_number?: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    sign_in_second_factor?: string;
    second_factor_identifier?: string;
    tenant?: string;
  };
  isSuperAdmin?: boolean;
}

const GOOGLE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getRemoteJWKSet() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
  }
  return jwks;
}

export async function verifyFirebaseToken(token: string): Promise<User> {
  const projectId = env.FIREBASE_PROJECT_ID;

  const keys = getRemoteJWKSet();
  const { payload } = (await jwtVerify(token, keys, {
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  })) as { payload: FirebaseJWTPayload };

  if (!payload.sub) {
    throw new Error("Missing subject (UID) claim");
  }

  return {
    id: payload.sub,
    email: payload.email || "",
    name: payload.name || "",
    avatar: payload.picture || null,
    isBanned: false,
    isDeleted: false,
    isVerified: payload.email_verified === true,
    isSuperAdmin: payload.isSuperAdmin === true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
