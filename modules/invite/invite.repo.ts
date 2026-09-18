import { randomBytes, randomUUID } from "node:crypto";

import { paginate } from "@/core/http";
import { db } from "@/modules/db";

import {
  INVITE_STATUS,
  INVITE_TTL_DAYS,
  type InviteStatusValue,
} from "./constants";

export const COLUMNS = [
  "id",
  "organization_id",
  "user_id",
  "person_id",
  "email",
  "token",
  "status",
  "description",
  "expires_at",
  "accepted_at",
  "canceled_at",
  "accept_attempts",
  "last_attempt_at",
  "locked_until",
  "created_by_id",
  "updated_by_id",
  "created_at",
  "updated_at",
] as const;

export type InviteRow = {
  id: string;
  organization_id: string;
  user_id: string | null;
  person_id: string;
  email: string;
  token: string;
  status: InviteStatusValue;
  description: string | null;
  expires_at: Date;
  accepted_at: Date | null;
  canceled_at: Date | null;
  accept_attempts: number;
  last_attempt_at: Date | null;
  locked_until: Date | null;
  created_by_id: string | null;
  updated_by_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type Executor = typeof db;

export function generateInviteToken(): string {
  return `${randomUUID()}${randomBytes(16).toString("hex")}`;
}

export function computeExpiry(days = INVITE_TTL_DAYS): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function findById(orgId: string, id: string) {
  return db
    .selectFrom("invite")
    .select(COLUMNS)
    .where("id", "=", id)
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<InviteRow | undefined>;
}

export async function findByToken(token: string) {
  return db
    .selectFrom("invite")
    .select(COLUMNS)
    .where("token", "=", token)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<InviteRow | undefined>;
}

export async function findPendingByPerson(orgId: string, personId: string) {
  return db
    .selectFrom("invite")
    .select(COLUMNS)
    .where("organization_id", "=", orgId)
    .where("person_id", "=", personId)
    .where("status", "=", INVITE_STATUS.PENDING)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<InviteRow | undefined>;
}

export async function tokenExists(token: string): Promise<boolean> {
  const row = await db
    .selectFrom("invite")
    .select("id")
    .where("token", "=", token)
    .executeTakeFirst();
  return !!row;
}

export async function generateUniqueToken(): Promise<string> {
  for (let i = 0; i < 5; i += 1) {
    const token = generateInviteToken();
    if (!(await tokenExists(token))) return token;
  }
  return generateInviteToken();
}

export async function insert(input: {
  organization_id: string;
  person_id: string;
  user_id: string | null;
  email: string;
  token: string;
  description?: string | null;
  expires_at: Date;
  created_by_id: string;
}) {
  return db
    .insertInto("invite")
    .values({
      organization_id: input.organization_id,
      person_id: input.person_id,
      user_id: input.user_id,
      email: input.email,
      token: input.token,
      status: INVITE_STATUS.PENDING,
      description: input.description ?? null,
      expires_at: input.expires_at,
      created_by_id: input.created_by_id,
    })
    .returning(COLUMNS)
    .executeTakeFirstOrThrow() as Promise<InviteRow>;
}

export async function updateById(
  id: string,
  patch: Partial<{
    token: string;
    status: InviteStatusValue;
    expires_at: Date;
    accepted_at: Date | null;
    canceled_at: Date | null;
    user_id: string | null;
    accept_attempts: number;
    last_attempt_at: Date | null;
    locked_until: Date | null;
    updated_by_id: string | null;
    description: string | null;
  }>,
  trx: Executor = db,
) {
  return trx
    .updateTable("invite")
    .set({ ...patch, updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returning(COLUMNS)
    .executeTakeFirst() as Promise<InviteRow | undefined>;
}

export async function search(
  orgId: string,
  params: { page: number; limit: number; status?: string },
) {
  let query = db
    .selectFrom("invite")
    .where("organization_id", "=", orgId)
    .where("deleted_at", "is", null);

  if (params.status) {
    query = query.where("status", "=", params.status as InviteStatusValue);
  }

  return paginate(
    query.select(COLUMNS).orderBy("created_at", "desc"),
    { page: params.page, limit: params.limit },
    ["created_at"],
  );
}
