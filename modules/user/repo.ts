import { db } from "@/core/database";
import type {
  DevicePlatform,
  UserLogEvent,
  UserStatus,
  VerificationType,
} from "@/core/database";

const alive = "deleted_at" as const;

export const User = {
  findById(id: string) {
    return db
      .selectFrom("user")
      .selectAll()
      .where("id", "=", id)
      .where(alive, "is", null)
      .executeTakeFirst();
  },

  findByEmail(email: string) {
    return db
      .selectFrom("user")
      .selectAll()
      .where("email", "=", email)
      .where(alive, "is", null)
      .executeTakeFirst();
  },

  findVerifiedRecovery(email: string, exceptUserId?: string) {
    let query = db
      .selectFrom("user")
      .selectAll()
      .where("recovery_email", "=", email)
      .where("is_recovery_email_verified", "=", true)
      .where(alive, "is", null);
    if (exceptUserId) query = query.where("id", "!=", exceptUserId);
    return query.executeTakeFirst();
  },

  insert(input: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
  }) {
    return db
      .insertInto("user")
      .values({
        first_name: input.firstName,
        last_name: input.lastName,
        full_name: input.fullName,
        email: input.email,
        status: "inactive",
        is_email_verified: false,
      })
      .returning(["id", "last_name"])
      .executeTakeFirstOrThrow();
  },

  markEmailVerified(id: string, status: UserStatus) {
    return db
      .updateTable("user")
      .set({
        is_email_verified: true,
        status,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();
  },

  touchLogin(id: string) {
    return db
      .updateTable("user")
      .set({ last_login_at: new Date(), updated_at: new Date() })
      .where("id", "=", id)
      .execute();
  },

  setRecovery(id: string, email: string) {
    return db
      .updateTable("user")
      .set({
        recovery_email: email,
        is_recovery_email_verified: true,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();
  },

  clearRecovery(id: string) {
    return db
      .updateTable("user")
      .set({
        recovery_email: null,
        is_recovery_email_verified: false,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();
  },

  changeEmail(id: string, email: string, status?: UserStatus) {
    return db
      .updateTable("user")
      .set({
        email,
        is_email_verified: true,
        ...(status ? { status } : {}),
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();
  },
};

export const UserIdentity = {
  findEmail(userId: string) {
    return db
      .selectFrom("user_identity")
      .selectAll()
      .where("user_id", "=", userId)
      .where("provider", "=", "email")
      .executeTakeFirst();
  },

  insertEmail(input: {
    userId: string;
    email: string;
    password: string;
  }) {
    return db
      .insertInto("user_identity")
      .values({
        user_id: input.userId,
        provider: "email",
        subject: input.email,
        email: input.email,
        email_verified: false,
        password: input.password,
      })
      .execute();
  },

  markEmailVerified(userId: string) {
    return db
      .updateTable("user_identity")
      .set({ email_verified: true, updated_at: new Date() })
      .where("user_id", "=", userId)
      .where("provider", "=", "email")
      .execute();
  },

  touchUsed(userId: string) {
    return db
      .updateTable("user_identity")
      .set({ last_used_at: new Date(), updated_at: new Date() })
      .where("user_id", "=", userId)
      .where("provider", "=", "email")
      .execute();
  },

  setPassword(userId: string, password: string) {
    return db
      .updateTable("user_identity")
      .set({
        password,
        last_password_change_at: new Date(),
        updated_at: new Date(),
      })
      .where("user_id", "=", userId)
      .where("provider", "=", "email")
      .execute();
  },

  setEmail(userId: string, email: string) {
    return db
      .updateTable("user_identity")
      .set({
        subject: email,
        email,
        email_verified: true,
        updated_at: new Date(),
      })
      .where("user_id", "=", userId)
      .where("provider", "=", "email")
      .execute();
  },
};

export const UserVerification = {
  findByHash(type: VerificationType, tokenHash: string) {
    return db
      .selectFrom("user_verification")
      .selectAll()
      .where("token_hash", "=", tokenHash)
      .where("type", "=", type)
      .executeTakeFirst();
  },

  /** Bekleyen satırları kapatır ve yenisini yazar. Ham token dönmez. */
  async replaceOpen(input: {
    userId: string;
    type: VerificationType;
    target: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    await db
      .updateTable("user_verification")
      .set({ consumed_at: new Date() })
      .where("user_id", "=", input.userId)
      .where("type", "=", input.type)
      .where("consumed_at", "is", null)
      .execute();
    await db
      .insertInto("user_verification")
      .values({
        user_id: input.userId,
        type: input.type,
        target: input.target,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
      })
      .execute();
  },

  consume(id: string) {
    return db
      .updateTable("user_verification")
      .set({ consumed_at: new Date() })
      .where("id", "=", id)
      .execute();
  },
};

export const UserDevice = {
  findByInstallation(userId: string, installationId: string) {
    return db
      .selectFrom("user_device")
      .select("id")
      .where("user_id", "=", userId)
      .where("installation_id", "=", installationId)
      .executeTakeFirst();
  },

  async open(input: {
    userId: string;
    installationId: string;
    platform: DevicePlatform;
    tokenHash: string;
    expiresAt: Date;
    ip: string | null;
  }) {
    const now = new Date();
    const existing = await UserDevice.findByInstallation(
      input.userId,
      input.installationId,
    );
    if (existing) {
      await db
        .updateTable("user_device")
        .set({
          platform: input.platform,
          token_hash: input.tokenHash,
          expires_at: input.expiresAt,
          revoked_at: null,
          last_seen_at: now,
          last_ip: input.ip,
          updated_at: now,
        })
        .where("id", "=", existing.id)
        .execute();
      return existing.id;
    }

    const created = await db
      .insertInto("user_device")
      .values({
        user_id: input.userId,
        installation_id: input.installationId,
        platform: input.platform,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
        last_seen_at: now,
        last_ip: input.ip,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return created.id;
  },

  clearToken(userId: string, tokenHash: string) {
    return db
      .updateTable("user_device")
      .set({ token_hash: null, expires_at: null, updated_at: new Date() })
      .where("user_id", "=", userId)
      .where("token_hash", "=", tokenHash)
      .execute();
  },
};

export const UserLog = {
  insert(input: {
    userId?: string | null;
    deviceId?: string | null;
    event: UserLogEvent;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return db
      .insertInto("user_log")
      .values({
        user_id: input.userId ?? null,
        device_id: input.deviceId ?? null,
        event: input.event,
        ip: input.ip ?? null,
        user_agent: input.userAgent ?? null,
        metadata: input.metadata ?? null,
      })
      .execute();
  },
};
