import { db } from "@/modules/db";
import type { UserGender } from "@/modules/db";

type Executor = typeof db;

export const COLUMNS = [
  "user_id",
  "country_id",
  "nationality_id",
  "gender",
  "birth_location",
  "birthdate",
  "phone_landline",
  "phone_number",
  "phone_verified_at",
  "created_at",
  "updated_at",
] as const;

export type ProfilePatch = {
  gender?: UserGender;
  country_id?: string | null;
  nationality_id?: string | null;
  birth_location?: string | null;
  birthdate?: string | Date | null;
  phone_landline?: string | null;
  phone_number?: string | null;
  phone_verified_at?: Date | null;
};

export async function findByUserId(userId: string, trx: Executor = db) {
  return trx
    .selectFrom("user_profile")
    .select(COLUMNS)
    .where("user_id", "=", userId)
    .executeTakeFirst();
}

export async function upsert(
  userId: string,
  patch: ProfilePatch,
  trx: Executor = db,
) {
  const existing = await findByUserId(userId, trx);
  const birthdate =
    patch.birthdate === undefined
      ? undefined
      : patch.birthdate
        ? new Date(patch.birthdate)
        : null;

  if (!existing) {
    return trx
      .insertInto("user_profile")
      .values({
        user_id: userId,
        gender: patch.gender ?? "none",
        country_id: patch.country_id ?? null,
        nationality_id: patch.nationality_id ?? null,
        birth_location: patch.birth_location ?? null,
        birthdate: birthdate ?? null,
        phone_landline: patch.phone_landline ?? null,
        phone_number: patch.phone_number ?? null,
        phone_verified_at: patch.phone_verified_at ?? null,
      })
      .returning(COLUMNS)
      .executeTakeFirstOrThrow();
  }

  const set: Record<string, unknown> = { updated_at: new Date() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) {
      set[k] = k === "birthdate" ? birthdate : v;
    }
  }

  return trx
    .updateTable("user_profile")
    .set(set)
    .where("user_id", "=", userId)
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}
