import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { db } from "@/modules/db";

export type PermissionSearchParams = PaginationParams & {
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type PermissionInsertInput = {
  slug: string;
  name: string;
  description?: string | null;
  is_locked?: boolean;
};

export type PermissionUpdateInput = {
  slug?: string;
  name?: string;
  description?: string | null;
  is_locked?: boolean;
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
    .selectFrom("permission")
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

/** Global slug (organization_id null). */
export async function findGlobalBySlug(slug: string) {
  return db
    .selectFrom("permission")
    .select("id")
    .where("slug", "=", slug)
    .where("organization_id", "is", null)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Global + session org. */
export async function search(orgId: string, params: PermissionSearchParams) {
  const { page, limit, q, sort, order } = params;
  let query = db
    .selectFrom("permission")
    .where("deleted_at", "is", null)
    .where((eb) =>
      eb.or([
        eb("organization_id", "is", null),
        eb("organization_id", "=", orgId),
      ]),
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

/** Insert. */
export async function insert(orgId: string, input: PermissionInsertInput) {
  return db
    .insertInto("permission")
    .values({
      organization_id: orgId,
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      is_locked: input.is_locked ?? false,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Güncelle. Yalnızca oturum org'unun satırı. */
export async function update(
  orgId: string,
  id: string,
  input: PermissionUpdateInput,
) {
  return db
    .updateTable("permission")
    .set({ ...input, updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Soft-delete. Yalnızca oturum org'unun satırı. */
export async function softDelete(orgId: string, id: string) {
  return db
    .updateTable("permission")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .returning(["id"])
    .executeTakeFirst();
}
