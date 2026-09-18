import { type JWTPayload, SignJWT, jwtVerify } from "jose";

import { env } from "@/core/env";

const encoder = new TextEncoder();

function secretKey() {
  return encoder.encode(env.JWT_SECRET);
}

/** Payload-agnostik JWT imza (HS256). */
export async function signJwt(
  payload: Record<string, unknown>,
  ttlSeconds: number,
): Promise<string> {
  const { sub, jti, ...rest } = payload;
  let builder = new SignJWT(rest).setProtectedHeader({ alg: "HS256" });
  if (typeof sub === "string") builder = builder.setSubject(sub);
  if (typeof jti === "string") builder = builder.setJti(jti);
  return builder
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey());
}

/** Payload-agnostik JWT doğrulama. */
export async function verifyJwt(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secretKey(), {
    algorithms: ["HS256"],
  });
  return payload;
}
