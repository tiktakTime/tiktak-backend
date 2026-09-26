import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { type AccessStatus, db } from "@/modules/db";

export type AccessSearchParams = PaginationParams & {
  organization_id?: string;
  status?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type AccessUpdateInput = {
  person_id?: string | null;
  role_id?: string | null;
  status?: AccessStatus;
  description?: string | null;
  expired_date?: string | Date | null;
};

export const COLUMNS = [
  "id",
  "organization_id",
  "user_id",
  "person_id",
  "role_id",
  "status",
  "expired_date",
  "description",
  "created_at",
  "updated_at",
] as const;

/** Kimliğe göre getir. */
export async function findById(id: string) {
  return db
    .selectFrom("access")
    .select(COLUMNS)
    .where("id", "=", id)
    .executeTakeFirst();
}

/** User + org çifti. */
export async function findByUserOrg(userId: string, organizationId: string) {
  return db
    .selectFrom("access")
    .select(COLUMNS)
    .where("user_id", "=", userId)
    .where("organization_id", "=", organizationId)
    .executeTakeFirst();
}

/** Sayfalayarak listele — user_id zorla. */
export async function search(userId: string, params: AccessSearchParams) {
  const { page, limit, organization_id, status, sort, order } = params;
  let query = db.selectFrom("access").where("user_id", "=", userId);

  if (organization_id) {
    query = query.where("organization_id", "=", organization_id);
  }
  if (status) query = query.where("status", "=", status as AccessStatus);

  return paginate(
    query.select(COLUMNS).orderBy("created_at", "desc"),
    { page, limit, ...toPaginateSort({ sort, order }) },
    ["created_at"],
  );
}

/** Insert. */
export async function insert(input: {
  organization_id: string;
  user_id: string;
  person_id?: string | null;
  role_id?: string | null;
  status?: AccessStatus;
  description?: string | null;
  expired_date?: Date | null;
}) {
  return db
    .insertInto("access")
    .values({
      organization_id: input.organization_id,
      user_id: input.user_id,
      person_id: input.person_id ?? null,
      role_id: input.role_id ?? null,
      status: input.status ?? "active",
      description: input.description ?? null,
      expired_date: input.expired_date ?? null,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Güncelle. */
export async function update(id: string, input: AccessUpdateInput) {
  const { expired_date, ...rest } = input;
  return db
    .updateTable("access")
    .set({
      ...rest,
      ...(expired_date !== undefined
        ? { expired_date: expired_date ? new Date(expired_date) : null }
        : {}),
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Upsert alanları ile güncelle. */
export async function updateUpsertFields(
  id: string,
  fields: {
    person_id?: string | null;
    role_id?: string | null;
    status?: AccessStatus;
    description?: string | null;
    expired_date?: Date | null;
  },
) {
  return db
    .updateTable("access")
    .set({
      person_id: fields.person_id ?? null,
      role_id: fields.role_id ?? null,
      status: fields.status ?? "active",
      description: fields.description ?? null,
      expired_date: fields.expired_date ?? null,
      updated_at: new Date(),
    })
    .where("id", "=", id)
    .returning(COLUMNS)
    .executeTakeFirst();
}

/** Hard delete. */
export async function deleteById(id: string) {
  return db
    .deleteFrom("access")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirst();
}

const BLOCKING_STATUSES = ["active", "inactive", "blocked"] as const;

/** Invite/create: org+user veya org+person için bloklayan access. */
export async function findBlocking(input: {
  organizationId: string;
  personId?: string | null;
  userId?: string | null;
}) {
  if (input.userId) {
    const byUser = await db
      .selectFrom("access")
      .select(COLUMNS)
      .where("organization_id", "=", input.organizationId)
      .where("user_id", "=", input.userId)
      .where("status", "in", [...BLOCKING_STATUSES])
      .executeTakeFirst();
    if (byUser) return byUser;
  }

  if (input.personId) {
    return db
      .selectFrom("access")
      .select(COLUMNS)
      .where("organization_id", "=", input.organizationId)
      .where("person_id", "=", input.personId)
      .where("status", "in", [...BLOCKING_STATUSES])
      .executeTakeFirst();
  }

  return undefined;
}

/** Person status sync from access upsert. */
export async function syncPersonFromAccess(
  personId: string,
  status: "active" | "inactive" | "blocked",
  expired_date?: Date | null,
) {
  return db
    .updateTable("person")
    .set({
      status,
      ...(expired_date !== undefined ? { expired_date } : {}),
      updated_at: new Date(),
    })
    .where("id", "=", personId)
    .execute();
}
