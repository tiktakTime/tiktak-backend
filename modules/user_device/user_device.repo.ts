import { db } from "@/modules/db";
import type { DevicePlatform } from "@/modules/db";

type Executor = typeof db;

export const COLUMNS = [
  "id",
  "user_id",
  "platform",
  "push_token",
  "device_id",
  "app_version",
  "is_active",
  "last_seen_at",
  "revoked_at",
  "created_at",
  "updated_at",
] as const;

export type DeviceUpsertInput = {
  user_id: string;
  platform: DevicePlatform;
  push_token: string;
  device_id?: string | null;
  app_version?: string | null;
};

/** FCM token upsert — UNIQUE(push_token); aynı token başka user’a geçer. */
export async function upsertByPushToken(
  input: DeviceUpsertInput,
  trx: Executor = db,
) {
  const now = new Date();
  const existing = await trx
    .selectFrom("user_device")
    .select(COLUMNS)
    .where("push_token", "=", input.push_token)
    .executeTakeFirst();

  if (existing) {
    return trx
      .updateTable("user_device")
      .set({
        user_id: input.user_id,
        platform: input.platform,
        device_id: input.device_id ?? existing.device_id,
        app_version: input.app_version ?? existing.app_version,
        is_active: true,
        last_seen_at: now,
        revoked_at: null,
        updated_at: now,
      })
      .where("id", "=", existing.id)
      .returning(COLUMNS)
      .executeTakeFirstOrThrow();
  }

  return trx
    .insertInto("user_device")
    .values({
      user_id: input.user_id,
      platform: input.platform,
      push_token: input.push_token,
      device_id: input.device_id ?? null,
      app_version: input.app_version ?? null,
      is_active: true,
      last_seen_at: now,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

export async function listActiveByUserId(userId: string, trx: Executor = db) {
  return trx
    .selectFrom("user_device")
    .select(COLUMNS)
    .where("user_id", "=", userId)
    .where("is_active", "=", true)
    .where("push_token", "is not", null)
    .execute();
}

export async function revokeByPushToken(
  userId: string,
  pushToken: string,
  trx: Executor = db,
) {
  const now = new Date();
  return trx
    .updateTable("user_device")
    .set({
      is_active: false,
      revoked_at: now,
      updated_at: now,
    })
    .where("user_id", "=", userId)
    .where("push_token", "=", pushToken)
    .returning(COLUMNS)
    .executeTakeFirst();
}
