import { db } from "@/modules/db";
import type { PersonPermissionEffect } from "@/modules/db";

export const COLUMNS = [
  "id",
  "organization_id",
  "person_id",
  "permission_id",
  "effect",
  "created_at",
  "updated_at",
] as const;

export type PersonPermissionInsertInput = {
  organization_id: string;
  person_id: string;
  permission_id: string;
  effect?: PersonPermissionEffect;
  created_by_id?: string | null;
};

/** Person’a ait tüm izin satırları (org kapsamında). */
export async function listByPerson(organizationId: string, personId: string) {
  return db
    .selectFrom("person_permission")
    .select(COLUMNS)
    .where("organization_id", "=", organizationId)
    .where("person_id", "=", personId)
    .orderBy("created_at", "asc")
    .execute();
}

/** Tek satır (org + person + permission). */
export async function findOne(input: {
  organizationId: string;
  personId: string;
  permissionId: string;
}) {
  return db
    .selectFrom("person_permission")
    .select(COLUMNS)
    .where("organization_id", "=", input.organizationId)
    .where("person_id", "=", input.personId)
    .where("permission_id", "=", input.permissionId)
    .executeTakeFirst();
}

/** Insert. */
export async function insert(input: PersonPermissionInsertInput) {
  return db
    .insertInto("person_permission")
    .values({
      organization_id: input.organization_id,
      person_id: input.person_id,
      permission_id: input.permission_id,
      effect: input.effect ?? "grant",
      created_by_id: input.created_by_id ?? null,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/**
 * Person izin setini değiştir: mevcut satırları sil, yenilerini yaz.
 * Caller transaction içinde `trx` geçebilir (şimdilik db).
 */
export async function replaceForPerson(input: {
  organizationId: string;
  personId: string;
  permissions: Array<{
    permission_id: string;
    effect?: PersonPermissionEffect;
  }>;
  actorUserId?: string | null;
}) {
  await db
    .deleteFrom("person_permission")
    .where("organization_id", "=", input.organizationId)
    .where("person_id", "=", input.personId)
    .execute();

  if (input.permissions.length === 0) return [];

  return db
    .insertInto("person_permission")
    .values(
      input.permissions.map((p) => ({
        organization_id: input.organizationId,
        person_id: input.personId,
        permission_id: p.permission_id,
        effect: p.effect ?? ("grant" as const),
        created_by_id: input.actorUserId ?? null,
      })),
    )
    .returning(COLUMNS)
    .execute();
}

/** Hard delete by id. */
export async function deleteById(id: string) {
  return db
    .deleteFrom("person_permission")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirst();
}
