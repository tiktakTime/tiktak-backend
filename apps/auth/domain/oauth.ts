import { type JWTPayload, createRemoteJWKSet, jwtVerify } from "jose";

import { env } from "@/core/env";
import { AppError } from "@/core/errors";
import { db } from "@/modules/db";
import type { AuthProvider } from "@/modules/db";
import * as userRepo from "@/modules/user/user.repo";
import * as identityRepo from "@/modules/user_identity/user_identity.repo";
import * as profileRepo from "@/modules/user_profile/user_profile.repo";

export type OAuthProvider = "google" | "apple";

export type OAuthClaims = {
  sub: string;
  email?: string | null;
  email_verified?: boolean;
  given_name?: string | null;
  family_name?: string | null;
  name?: string | null;
  picture?: string | null;
  locale?: string | null;
};

const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const appleJwks = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);

function parseClientIds(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function splitName(full?: string | null): {
  given?: string;
  family?: string;
} {
  if (!full?.trim()) return {};
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { given: parts[0] };
  return { given: parts[0], family: parts.slice(1).join(" ") };
}

/** Google veya Apple id_token doğrula → normalize claims. */
export async function verifyOAuthIdToken(
  provider: OAuthProvider,
  idToken: string,
): Promise<OAuthClaims> {
  if (provider === "google") {
    const audiences = parseClientIds(env.GOOGLE_CLIENT_IDS);
    if (audiences.length === 0) {
      throw new AppError("OAUTH_NOT_CONFIGURED");
    }
    const { payload } = await jwtVerify(idToken, googleJwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: audiences,
    });
    return mapGooglePayload(payload);
  }

  const audiences = parseClientIds(env.APPLE_CLIENT_IDS);
  if (audiences.length === 0) {
    throw new AppError("OAUTH_NOT_CONFIGURED");
  }
  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: audiences,
  });
  return mapApplePayload(payload);
}

function mapGooglePayload(payload: JWTPayload): OAuthClaims {
  const sub = payload.sub;
  if (!sub) throw new AppError("INVALID_TOKEN_AUTH");
  return {
    sub,
    email: typeof payload.email === "string" ? payload.email : null,
    email_verified: asBool(payload.email_verified),
    given_name:
      typeof payload.given_name === "string" ? payload.given_name : null,
    family_name:
      typeof payload.family_name === "string" ? payload.family_name : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
    locale: typeof payload.locale === "string" ? payload.locale : null,
  };
}

function mapApplePayload(payload: JWTPayload): OAuthClaims {
  const sub = payload.sub;
  if (!sub) throw new AppError("INVALID_TOKEN_AUTH");
  return {
    sub,
    email: typeof payload.email === "string" ? payload.email : null,
    email_verified: asBool(payload.email_verified),
  };
}

/**
 * OAuth: (provider, sub) ile bul veya oluştur → user_id.
 * Email boş olsa da user oluşur.
 */
export async function resolveOAuthUser(input: {
  provider: OAuthProvider;
  claims: OAuthClaims;
  first_name?: string | null;
  last_name?: string | null;
}) {
  const provider = input.provider as AuthProvider;
  const existing = await identityRepo.findByProviderSubject(
    provider,
    input.claims.sub,
  );

  if (existing) {
    const user = await userRepo.findById(existing.user_id);
    if (!user || user.status === "blocked") {
      throw new AppError("USER_INACTIVE");
    }
    if (user.status !== "active") {
      // OAuth verified path: activate inactive
      await db
        .updateTable("user")
        .set({ status: "active", updated_at: new Date() })
        .where("id", "=", user.id)
        .execute();
    }
    await identityRepo.touchLastUsed(existing.id);
    await userRepo.touchLastLogin(existing.user_id);

    // Soft-fill missing profile / email
    const email = input.claims.email?.toLowerCase() ?? null;
    if (email && !user.email) {
      await db
        .updateTable("user")
        .set({
          email,
          email_verified_at:
            input.claims.email_verified === false ? null : new Date(),
          updated_at: new Date(),
        })
        .where("id", "=", user.id)
        .execute();
    }

    return { id: existing.user_id };
  }

  const fromToken = splitName(input.claims.name);
  const first_name =
    input.first_name?.trim() ||
    input.claims.given_name?.trim() ||
    fromToken.given ||
    "";
  const last_name =
    input.last_name?.trim() ||
    input.claims.family_name?.trim() ||
    fromToken.family ||
    "";
  const email = input.claims.email?.toLowerCase() ?? null;

  if (email) {
    const byEmail = await userRepo.findIdByEmail(email);
    if (byEmail) {
      const linked = await identityRepo.insert({
        user_id: byEmail,
        provider,
        provider_subject: input.claims.sub,
        provider_email: email,
      });
      await identityRepo.touchLastUsed(linked.id);
      await userRepo.touchLastLogin(byEmail);
      return { id: byEmail };
    }
  }

  const userId = await db.transaction().execute(async (trx) => {
    const user = await userRepo.insertUser(
      {
        email,
        status: "active",
        first_name,
        last_name,
        picture: input.claims.picture ?? null,
        locale: input.claims.locale ?? null,
        email_verified_at:
          email && input.claims.email_verified !== false ? new Date() : null,
      },
      trx,
    );

    await profileRepo.upsert(user.id, {}, trx);

    await identityRepo.insert(
      {
        user_id: user.id,
        provider,
        provider_subject: input.claims.sub,
        provider_email: email,
      },
      trx,
    );

    return user.id;
  });

  await userRepo.touchLastLogin(userId);
  return { id: userId };
}
