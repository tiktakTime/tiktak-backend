import { db } from "@/modules/db";

export const COLUMNS = [
  "id",
  "organization_id",
  "role_id",
  "permission_id",
  "created_at",
  "updated_at",
] as const;

export type RolePermissionInsertInput = {
  organization_id?: string | null;
  role_id: string;
  permission_id: string;
};

/** Role’e bağlı izin satırları (org + global). */
export async function listByRole(
  roleId: string,
  organizationId?: string | null,
) {
  let query = db
    .selectFrom("role_permission")
    .select(COLUMNS)
    .where("role_id", "=", roleId);

  if (organizationId !== undefined) {
    query = query.where((eb) =>
      eb.or([
        eb("organization_id", "=", organizationId),
        eb("organization_id", "is", null),
      ]),
    );
  }

  return query.orderBy("created_at", "asc").execute();
}

/**
 * Role için permission slug listesi.
 * `role_permission` org’a ait veya global; permission satırı da org/global olmalı.
 */
export async function listPermissionSlugsForRole(input: {
  organizationId: string;
  roleId: string;
}): Promise<string[]> {
  const rows = await db
    .selectFrom("role_permission as rp")
    .innerJoin("permission as p", "p.id", "rp.permission_id")
    .select("p.slug")
    .where("rp.role_id", "=", input.roleId)
    .where("p.deleted_at", "is", null)
    .where((eb) =>
      eb.or([
        eb("rp.organization_id", "=", input.organizationId),
        eb("rp.organization_id", "is", null),
      ]),
    )
    .where((eb) =>
      eb.or([
        eb("p.organization_id", "=", input.organizationId),
        eb("p.organization_id", "is", null),
      ]),
    )
    .execute();

  const slugs = [...new Set(rows.map((r) => r.slug).filter(Boolean))];
  slugs.sort();
  return slugs;
}

/** Insert. */
export async function insert(input: RolePermissionInsertInput) {
  return db
    .insertInto("role_permission")
    .values({
      organization_id: input.organization_id ?? null,
      role_id: input.role_id,
      permission_id: input.permission_id,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Role izin setini değiştir (org kapsamı). */
export async function replaceForRole(input: {
  organizationId: string | null;
  roleId: string;
  permissionIds: string[];
}) {
  let del = db
    .deleteFrom("role_permission")
    .where("role_id", "=", input.roleId);

  if (input.organizationId === null) {
    del = del.where("organization_id", "is", null);
  } else {
    del = del.where("organization_id", "=", input.organizationId);
  }
  await del.execute();

  if (input.permissionIds.length === 0) return [];

  return db
    .insertInto("role_permission")
    .values(
      input.permissionIds.map((permission_id) => ({
        organization_id: input.organizationId,
        role_id: input.roleId,
        permission_id,
      })),
    )
    .returning(COLUMNS)
    .execute();
}

/** Hard delete by id. */
export async function deleteById(id: string) {
  return db
    .deleteFrom("role_permission")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirst();
}
