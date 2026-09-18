import { type PaginationParams, paginate, toPaginateSort } from "@/core/http";
import { db } from "@/modules/db";
import type { UserStatus } from "@/modules/db";
import * as identityRepo from "@/modules/user_identity/user_identity.repo";
import * as profileRepo from "@/modules/user_profile/user_profile.repo";

export type UserSearchParams = PaginationParams & {
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type UserInsertInput = {
  email?: string | null;
  status?: UserStatus;
  first_name?: string;
  last_name?: string;
  display_name?: string | null;
  picture?: string | null;
  locale?: string | null;
  timezone?: string | null;
  expires_at?: string | Date | null;
  email_verified_at?: Date | null;
  two_factor_enabled_at?: Date | null;
  system_role_id?: string | null;
};

/** Identity + profile alanları (HTTP / member). */
export const PUBLIC_COLUMNS = [
  "id",
  "system_role_id",
  "email",
  "status",
  "first_name",
  "last_name",
  "display_name",
  "picture",
  "locale",
  "timezone",
  "expires_at",
  "email_verified_at",
  "two_factor_enabled_at",
  "created_at",
  "updated_at",
] as const;

export type PublicUserRow = {
  id: string;
  system_role_id: string | null;
  email: string | null;
  status: UserStatus;
  first_name: string;
  last_name: string;
  display_name: string | null;
  picture: string | null;
  locale: string | null;
  timezone: string | null;
  expires_at: Date | null;
  email_verified_at: Date | null;
  two_factor_enabled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  gender: string;
  country_id: string | null;
  nationality_id: string | null;
  birth_location: string | null;
  birthdate: Date | null;
  phone_landline: string | null;
  phone_number: string | null;
  phone_verified_at: Date | null;
};

function mergeUserProfile(
  user: {
    id: string;
    system_role_id: string | null;
    email: string | null;
    status: UserStatus;
    first_name: string;
    last_name: string;
    display_name: string | null;
    picture: string | null;
    locale: string | null;
    timezone: string | null;
    expires_at: Date | null;
    email_verified_at: Date | null;
    two_factor_enabled_at: Date | null;
    created_at: Date;
    updated_at: Date;
  },
  profile: Awaited<ReturnType<typeof profileRepo.findByUserId>> | null,
): PublicUserRow {
  return {
    ...user,
    gender: profile?.gender ?? "none",
    country_id: profile?.country_id ?? null,
    nationality_id: profile?.nationality_id ?? null,
    birth_location: profile?.birth_location ?? null,
    birthdate: profile?.birthdate ?? null,
    phone_landline: profile?.phone_landline ?? null,
    phone_number: profile?.phone_number ?? null,
    phone_verified_at: profile?.phone_verified_at ?? null,
  };
}

/** Kimliğe göre getir (+ profil). */
export async function findById(id: string) {
  const user = await db
    .selectFrom("user")
    .select(PUBLIC_COLUMNS)
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  if (!user) return undefined;
  const profile = await profileRepo.findByUserId(id);
  return mergeUserProfile(user, profile ?? null);
}

/** Auth: email → user (password identity ayrı). */
export async function findAuthByEmail(email: string) {
  return db
    .selectFrom("user")
    .select(["id", "status", "deleted_at", "email"])
    .where("email", "=", email)
    .executeTakeFirst();
}

/** Org create / person bootstrap. */
export async function findNameEmailById(id: string) {
  return db
    .selectFrom("user")
    .select(["id", "email", "first_name", "last_name"])
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Sayfalayarak listele (profil join). */
export async function search({
  page,
  limit,
  q,
  sort,
  order,
}: UserSearchParams) {
  let query = db
    .selectFrom("user")
    .leftJoin("user_profile", "user_profile.user_id", "user.id")
    .where("user.deleted_at", "is", null);

  if (q) {
    const pattern = `%${q}%`;
    query = query.where((eb) =>
      eb.or([
        eb("user.first_name", "ilike", pattern),
        eb("user.last_name", "ilike", pattern),
        eb("user.display_name", "ilike", pattern),
        eb("user.email", "ilike", pattern),
      ]),
    );
  }

  const result = await paginate(
    query
      .select([
        "user.id",
        "user.system_role_id",
        "user.email",
        "user.status",
        "user.first_name",
        "user.last_name",
        "user.display_name",
        "user.picture",
        "user.locale",
        "user.timezone",
        "user.expires_at",
        "user.email_verified_at",
        "user.two_factor_enabled_at",
        "user.created_at",
        "user.updated_at",
        "user_profile.gender",
        "user_profile.country_id",
        "user_profile.nationality_id",
        "user_profile.birth_location",
        "user_profile.birthdate",
        "user_profile.phone_landline",
        "user_profile.phone_number",
        "user_profile.phone_verified_at",
      ])
      .orderBy("user.created_at", "desc"),
    { page, limit, ...toPaginateSort({ sort, order }) },
    ["user.created_at"],
  );

  return {
    ...result,
    data: result.data.map((row) => ({
      id: row.id,
      system_role_id: row.system_role_id,
      email: row.email,
      status: row.status,
      first_name: row.first_name,
      last_name: row.last_name,
      display_name: row.display_name,
      picture: row.picture,
      locale: row.locale,
      timezone: row.timezone,
      expires_at: row.expires_at,
      email_verified_at: row.email_verified_at,
      two_factor_enabled_at: row.two_factor_enabled_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      gender: row.gender ?? "none",
      country_id: row.country_id,
      nationality_id: row.nationality_id,
      birth_location: row.birth_location,
      birthdate: row.birthdate,
      phone_landline: row.phone_landline,
      phone_number: row.phone_number,
      phone_verified_at: row.phone_verified_at,
    })),
  };
}

type Executor = typeof db;

/** İnce user satırı. */
export async function insertUser(input: UserInsertInput, trx: Executor = db) {
  return trx
    .insertInto("user")
    .values({
      email: input.email ?? null,
      status: input.status ?? "inactive",
      first_name: input.first_name ?? "",
      last_name: input.last_name ?? "",
      display_name: input.display_name ?? null,
      picture: input.picture ?? null,
      locale: input.locale ?? null,
      timezone: input.timezone ?? null,
      expires_at: input.expires_at ? new Date(input.expires_at) : null,
      email_verified_at: input.email_verified_at ?? null,
      two_factor_enabled_at: input.two_factor_enabled_at ?? null,
      system_role_id: input.system_role_id ?? null,
    })
    .returning(PUBLIC_COLUMNS)
    .executeTakeFirstOrThrow();
}

/** Admin create: user + profile (+ optional password identity). */
export async function create(input: {
  first_name: string;
  last_name: string;
  display_name?: string | null;
  email?: string | null;
  password?: string | null;
  gender?: "female" | "male" | "none";
  status?: UserStatus;
  expires_at?: string | Date | null;
  country_id?: string | null;
  nationality_id?: string | null;
  birth_location?: string | null;
  birthdate?: string | null;
  picture?: string | null;
  locale?: string | null;
  timezone?: string | null;
  phone_landline?: string | null;
  phone_number?: string | null;
  email_verified_at?: Date | null;
  phone_verified_at?: Date | null;
  two_factor_enabled_at?: Date | null;
}) {
  return db.transaction().execute(async (trx) => {
    const user = await insertUser(
      {
        email: input.email ?? null,
        status: input.status ?? "inactive",
        first_name: input.first_name,
        last_name: input.last_name,
        display_name: input.display_name,
        picture: input.picture,
        locale: input.locale,
        timezone: input.timezone,
        expires_at: input.expires_at,
        email_verified_at: input.email_verified_at,
        two_factor_enabled_at: input.two_factor_enabled_at,
      },
      trx,
    );

    await profileRepo.upsert(
      user.id,
      {
        gender: input.gender ?? "none",
        country_id: input.country_id,
        nationality_id: input.nationality_id,
        birth_location: input.birth_location,
        birthdate: input.birthdate,
        phone_landline: input.phone_landline,
        phone_number: input.phone_number,
        phone_verified_at: input.phone_verified_at,
      },
      trx,
    );

    if (input.password) {
      await identityRepo.upsertPassword(user.id, input.password, trx);
    }

    return findById(user.id);
  });
}

/** Güncelle (user + profile alanları). */
export async function update(
  id: string,
  input: Partial<{
    email: string | null;
    status: UserStatus;
    expires_at: string | Date | null;
    email_verified_at: Date | null;
    two_factor_enabled_at: Date | null;
    first_name: string;
    last_name: string;
    display_name: string | null;
    picture: string | null;
    locale: string | null;
    timezone: string | null;
    gender: "female" | "male" | "none";
    country_id: string | null;
    nationality_id: string | null;
    birth_location: string | null;
    birthdate: string | null;
    phone_landline: string | null;
    phone_number: string | null;
    phone_verified_at: Date | null;
    password: string | null;
  }>,
) {
  const userSet: Record<string, unknown> = {};
  if (input.email !== undefined) userSet.email = input.email;
  if (input.status !== undefined) userSet.status = input.status;
  if (input.first_name !== undefined) userSet.first_name = input.first_name;
  if (input.last_name !== undefined) userSet.last_name = input.last_name;
  if (input.display_name !== undefined)
    userSet.display_name = input.display_name;
  if (input.picture !== undefined) userSet.picture = input.picture;
  if (input.locale !== undefined) userSet.locale = input.locale;
  if (input.timezone !== undefined) userSet.timezone = input.timezone;
  if (input.email_verified_at !== undefined) {
    userSet.email_verified_at = input.email_verified_at;
  }
  if (input.two_factor_enabled_at !== undefined) {
    userSet.two_factor_enabled_at = input.two_factor_enabled_at;
  }
  if (input.expires_at !== undefined) {
    userSet.expires_at = input.expires_at ? new Date(input.expires_at) : null;
  }

  if (Object.keys(userSet).length > 0) {
    await db
      .updateTable("user")
      .set({ ...userSet, updated_at: new Date() })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute();
  }

  await profileRepo.upsert(id, {
    gender: input.gender,
    country_id: input.country_id,
    nationality_id: input.nationality_id,
    birth_location: input.birth_location,
    birthdate: input.birthdate,
    phone_landline: input.phone_landline,
    phone_number: input.phone_number,
    phone_verified_at: input.phone_verified_at,
  });

  if (input.password) {
    await identityRepo.upsertPassword(id, input.password);
  }

  return findById(id);
}

export async function softDelete(id: string) {
  return db
    .updateTable("user")
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returning(["id"])
    .executeTakeFirst();
}

export async function findIdByEmail(email: string) {
  const row = await db
    .selectFrom("user")
    .select("id")
    .where("email", "=", email)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row?.id;
}

export async function findIdByRecoveryEmail(email: string) {
  const row = await db
    .selectFrom("user")
    .select("id")
    .where("recovery_email", "=", email)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row?.id;
}

export async function findAuthProfileByEmail(email: string) {
  return db
    .selectFrom("user")
    .select(["id", "email", "status", "first_name", "last_name"])
    .where("email", "=", email)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

export async function findByVerifiedRecoveryEmail(email: string) {
  return db
    .selectFrom("user")
    .select(["id", "email", "first_name", "last_name"])
    .where("recovery_email", "=", email)
    .where("recovery_email_verified_at", "is not", null)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/** Sign-up / invite: user + profile + password identity. */
export async function createAuthUser(input: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  status: "active" | "inactive" | "blocked";
  email_verified_at?: Date | null;
  picture?: string | null;
}) {
  return db.transaction().execute(async (trx) => {
    const user = await insertUser(
      {
        email: input.email,
        status: input.status,
        first_name: input.first_name,
        last_name: input.last_name,
        picture: input.picture ?? null,
        email_verified_at: input.email_verified_at ?? null,
      },
      trx,
    );

    await profileRepo.upsert(user.id, {}, trx);
    await identityRepo.upsertPassword(user.id, input.password, trx);

    return {
      id: user.id,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      status: user.status,
      created_at: user.created_at,
    };
  });
}

export async function markEmailVerified(userId: string) {
  return db
    .updateTable("user")
    .set({
      email_verified_at: new Date(),
      status: "active",
      updated_at: new Date(),
    })
    .where("id", "=", userId)
    .execute();
}

export async function updatePassword(userId: string, passwordHash: string) {
  await identityRepo.upsertPassword(userId, passwordHash);
  return db
    .updateTable("user")
    .set({ updated_at: new Date() })
    .where("id", "=", userId)
    .execute();
}

export async function setRecoveryEmail(userId: string, recoveryEmail: string) {
  return db
    .updateTable("user")
    .set({
      recovery_email: recoveryEmail,
      recovery_email_verified_at: new Date(),
      updated_at: new Date(),
    })
    .where("id", "=", userId)
    .execute();
}

export async function clearRecoveryEmail(userId: string) {
  return db
    .updateTable("user")
    .set({
      recovery_email: null,
      recovery_email_verified_at: null,
      updated_at: new Date(),
    })
    .where("id", "=", userId)
    .execute();
}

export async function changeEmail(
  userId: string,
  email: string,
  opts?: { activateIfInactive?: boolean },
) {
  await db
    .updateTable("user")
    .set({
      email,
      email_verified_at: new Date(),
      ...(opts?.activateIfInactive ? { status: "active" as const } : {}),
      updated_at: new Date(),
    })
    .where("id", "=", userId)
    .execute();

  await db
    .updateTable("person")
    .set({ email, updated_at: new Date() })
    .where("user_id", "=", userId)
    .where("deleted_at", "is", null)
    .execute();
}

export async function touchLastLogin(userId: string) {
  return db
    .updateTable("user")
    .set({ last_login_at: new Date(), updated_at: new Date() })
    .where("id", "=", userId)
    .execute();
}
