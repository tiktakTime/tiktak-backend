import { randomToken, sha256 } from "@/core/crypto";
import { AppError } from "@/core/errors";
import { VerificationType } from "@/modules/db";
import { UserVerification } from "@/modules/user/repo";

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

export function expired(value: Date | string): boolean {
  return new Date(value).getTime() <= Date.now();
}

export async function issueVerification(input: {
  userId: string;
  type: VerificationType;
  target: string;
  ttlMs: number;
}): Promise<string> {
  const token = randomToken(32);
  await UserVerification.replaceOpen({
    userId: input.userId,
    type: input.type,
    target: input.target,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + input.ttlMs),
  });
  return token;
}

export async function readToken(type: VerificationType, token: string) {
  const row = await UserVerification.findByHash(type, sha256(token));
  if (!row) throw new AppError("INVALID_TOKEN");
  return row;
}
