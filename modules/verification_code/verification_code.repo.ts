import { randomBytes, randomUUID } from "node:crypto";

import { AppError } from "@/core/errors";
import { db } from "@/modules/db";

export const VERIFICATION_TYPES = [
  "register",
  "invite",
  "access_confirm",
  "password_reset",
  "email_change",
  "two_factor",
  "phone_verification",
  "account_recovery",
  "login_verification",
] as const;

export type VerificationType = (typeof VERIFICATION_TYPES)[number];

export const VERIFICATION_STATUSES = [
  "pending",
  "verified",
  "expired",
  "cancelled",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const COLUMNS = [
  "id",
  "organization_id",
  "user_id",
  "type",
  "email",
  "phone",
  "code",
  "token",
  "status",
  "expires_at",
  "used_at",
  "attempts",
  "max_attempts",
  "ip_address",
  "user_agent",
  "metadata",
  "created_at",
  "updated_at",
] as const;

export type VerificationCodeRow = {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  type: VerificationType;
  email: string | null;
  phone: string | null;
  code: string | null;
  token: string | null;
  status: VerificationStatus;
  expires_at: Date;
  used_at: Date | null;
  attempts: number;
  max_attempts: number;
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown;
  created_at: Date;
  updated_at: Date;
};

export function generateToken(): string {
  return `${randomUUID()}${randomBytes(16).toString("hex")}`;
}

export async function findByToken(
  token: string,
  type: VerificationType,
  status?: VerificationStatus,
) {
  let query = db
    .selectFrom("verification_code")
    .select(COLUMNS)
    .where("token", "=", token)
    .where("type", "=", type);

  if (status) query = query.where("status", "=", status);

  return query.executeTakeFirst() as Promise<VerificationCodeRow | undefined>;
}

export async function cancelPending(input: {
  userId: string;
  type: VerificationType;
}) {
  return db
    .updateTable("verification_code")
    .set({ status: "cancelled", updated_at: new Date() })
    .where("user_id", "=", input.userId)
    .where("type", "=", input.type)
    .where("status", "=", "pending")
    .execute();
}

export async function create(input: {
  user_id?: string | null;
  organization_id?: string | null;
  email?: string | null;
  type: VerificationType;
  token: string;
  expires_at: Date;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return db
    .insertInto("verification_code")
    .values({
      user_id: input.user_id ?? null,
      organization_id: input.organization_id ?? null,
      email: input.email ?? null,
      type: input.type,
      token: input.token,
      status: "pending",
      expires_at: input.expires_at,
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
      metadata: (input.metadata ?? null) as never,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow() as Promise<VerificationCodeRow>;
}

export async function markVerified(id: string) {
  return db
    .updateTable("verification_code")
    .set({
      status: "verified",
      used_at: new Date(),
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .execute();
}

export async function markExpired(id: string) {
  return db
    .updateTable("verification_code")
    .set({ status: "expired", updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

/** Token kaydını bul; yoksa INVALID_TOKEN. */
export async function requireTokenRecord(
  token: string,
  type: VerificationType,
  opts?: { pendingOnly?: boolean },
): Promise<VerificationCodeRow> {
  const record = await findByToken(
    token,
    type,
    opts?.pendingOnly ? "pending" : undefined,
  );
  if (!record) throw new AppError("INVALID_TOKEN");
  return record;
}

/** Pending kaydın süresini kontrol et; dolmuşsa expired işaretle. */
export async function assertNotExpired(
  record: VerificationCodeRow,
): Promise<void> {
  if (new Date(record.expires_at) < new Date()) {
    await markExpired(record.id);
    throw new AppError("TOKEN_EXPIRED");
  }
}
