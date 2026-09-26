import { db } from "@/modules/db";
import type { AuthProvider } from "@/modules/db";

type Executor = typeof db;

export const COLUMNS = [
  "id",
  "user_id",
  "provider",
  "provider_subject",
  "provider_email",
  "password_hash",
  "password_changed_at",
  "linked_at",
  "last_used_at",
  "created_at",
  "updated_at",
] as const;

export async function findByProviderSubject(
  provider: AuthProvider,
  providerSubject: string,
  trx: Executor = db,
) {
  return trx
    .selectFrom("user_identity")
    .select(COLUMNS)
    .where("provider", "=", provider)
    .where("provider_subject", "=", providerSubject)
    .executeTakeFirst();
}

export async function findPasswordByUserId(userId: string, trx: Executor = db) {
  return trx
    .selectFrom("user_identity")
    .select(COLUMNS)
    .where("user_id", "=", userId)
    .where("provider", "=", "password")
    .executeTakeFirst();
}

export async function insert(
  values: {
    user_id: string;
    provider: AuthProvider;
    provider_subject: string;
    provider_email?: string | null;
    password_hash?: string | null;
    password_changed_at?: Date | null;
  },
  trx: Executor = db,
) {
  return trx
    .insertInto("user_identity")
    .values({
      user_id: values.user_id,
      provider: values.provider,
      provider_subject: values.provider_subject,
      provider_email: values.provider_email ?? null,
      password_hash: values.password_hash ?? null,
      password_changed_at: values.password_changed_at ?? null,
      last_used_at: new Date(),
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Password identity upsert. Konu kullanıcı kimliğidir; sabit "local" ikinci hesabı unique'de keser. */
export async function upsertPassword(
  userId: string,
  passwordHash: string,
  trx: Executor = db,
) {
  const now = new Date();
  const existing = await findPasswordByUserId(userId, trx);
  if (existing) {
    return trx
      .updateTable("user_identity")
      .set({
        password_hash: passwordHash,
        password_changed_at: now,
        updated_at: now,
        last_used_at: now,
      })
      .where("id", "=", existing.id)
      .returning(COLUMNS)
      .executeTakeFirstOrThrow();
  }
  return insert(
    {
      user_id: userId,
      provider: "password",
      provider_subject: userId,
      password_hash: passwordHash,
      password_changed_at: now,
    },
    trx,
  );
}

export async function touchLastUsed(id: string, trx: Executor = db) {
  return trx
    .updateTable("user_identity")
    .set({ last_used_at: new Date(), updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}
