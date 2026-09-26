import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { db } from "@/modules/db";

export type RoleSearchParams = PaginationParams & {
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type RoleInsertInput = {
  slug?: string | null;
  name: string;
  description?: string | null;
  is_locked?: boolean;
  permissions?: string[];
};

export type RoleUpdateInput = {
  slug?: string | null;
  name?: string;
  description?: string | null;
  is_locked?: boolean;
  permissions?: string[];
};

export const COLUMNS = [
  "id",
  "organization_id",
  "slug",
  "name",
  "description",
  "is_locked",
  "created_at",
  "updated_at",
] as const;

/** Kimliğe göre getir. Global satır (`organization_id` null) her org'a görünür. */
export async function findById(orgId: string, id: string) {
  return db
    .selectFrom("role")
    .select(COLUMNS)
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .where((eb) =>
      eb.or([
        eb("organization_id", "is", null),
        eb("organization_id", "=", orgId),
      ]),
    )
    .executeTakeFirst();
}

/** Global + session org; super_admin hariç. */
export async function search(orgId: string, params: RoleSearchParams) {
  const { page, limit, q, sort, order } = params;
  let query = db
    .selectFrom("role")
    .where("deleted_at", "is", null)
    .where((eb) =>
      eb.or([
        eb("organization_id", "is", null),
        eb("organization_id", "=", orgId),
      ]),
    )
    .where((eb) =>
      eb.or([eb("slug", "is", null), eb("slug", "!=", "super_admin")]),
    );

  if (q) {
    const pattern = `%${q}%`;
    query = query.where((eb) =>
      eb.or([eb("name", "ilike", pattern), eb("slug", "ilike", pattern)]),
    );
  }

  return paginate(
    query.select(COLUMNS).orderBy("created_at", "desc"),
    { page, limit, ...toPaginateSort({ sort, order }) },
    ["created_at"],
  );
}

/** Insert — organization_id = session org. */
export async function insert(orgId: string, input: RoleInsertInput) {
  const { permissions: _permissions, ...row } = input;
  return db
    .insertInto("role")
    .values({
      organization_id: orgId,
      slug: row.slug ?? null,
      name: row.name,
      description: row.description ?? null,
      is_locked: row.is_locked ?? false,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Güncelle. Yalnızca oturum org'unun satırı. */
export async function update(
  orgId: string,
  id: string,
  input: RoleUpdateInput,
) {
  const { permissions: _permissions, ...rest } = input;
  return db
    .updateTable("role")
    .set({ ...rest, updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Soft-delete. Yalnızca oturum org'unun satırı. */
export async function softDelete(orgId: string, id: string) {
  return db
    .updateTable("role")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(["id"])
    .executeTakeFirst();
}
