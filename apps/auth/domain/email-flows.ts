import { hash } from "bcryptjs";

import { AppError } from "@/core/errors";
import * as repo from "@/modules/user/user.repo";
import * as verification from "@/modules/verification_code/verification_code.repo";
import {
  type MailPlatform,
  buildVerificationLink,
  resolvePlatform,
  sendEmail,
} from "@/platform/notifications";

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export type ClientMeta = {
  platform?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

/** Kayıt: inactive user + register token + verify mail. */
export async function signUpUser(input: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  meta?: ClientMeta;
}) {
  const email = input.email.toLowerCase();
  const existing = await repo.findIdByEmail(email);
  if (existing) throw new AppError("EMAIL_ALREADY_EXISTS");

  const hashed = await hash(input.password, 10);
  const user = await repo.createAuthUser({
    first_name: input.first_name,
    last_name: input.last_name,
    email,
    password: hashed,
    status: "inactive",
    email_verified_at: null,
  });

  const platform = resolvePlatform(input.meta?.platform);
  const token = verification.generateToken();

  await verification.create({
    user_id: user.id,
    email,
    type: "register",
    token,
    expires_at: hoursFromNow(24),
    ip_address: input.meta?.ip ?? null,
    user_agent: input.meta?.userAgent ?? null,
    metadata: { platform },
  });

  await sendEmail({
    key: "v2:verifyEmail",
    userId: user.id,
    mail: email,
    payload: {
      lastName: user.last_name,
      token: buildVerificationLink("/verify-email", token, platform),
    },
  });

  return user;
}

/** Public: register token ile e-posta doğrula. */
export async function verifyEmail(token: string) {
  const record = await verification.requireTokenRecord(token, "register");

  const user = record.user_id ? await repo.findById(record.user_id) : undefined;

  if (record.status === "verified") {
    if (user?.email_verified_at) {
      return {
        user_id: record.user_id,
        platform: platformFromMeta(record.metadata),
      };
    }
    throw new AppError("INVALID_TOKEN");
  }

  if (record.status !== "pending") {
    throw new AppError("INVALID_TOKEN");
  }

  await verification.assertNotExpired(record);

  if (!record.user_id) throw new AppError("INVALID_TOKEN");

  await repo.markEmailVerified(record.user_id);
  await verification.markVerified(record.id);

  return {
    user_id: record.user_id,
    platform: platformFromMeta(record.metadata),
  };
}

/** Oturum: doğrulama mailini yeniden gönder. */
export async function requestEmailVerification(
  userId: string,
  meta?: ClientMeta,
) {
  const user = await repo.findById(userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  if (user.email_verified_at) {
    return { already_verified: true as const };
  }

  await verification.cancelPending({ userId, type: "register" });

  const platform = resolvePlatform(meta?.platform);
  const token = verification.generateToken();
  if (!user.email) throw new AppError("EMAIL_REQUIRED");
  const email = user.email.toLowerCase();

  await verification.create({
    user_id: user.id,
    email,
    type: "register",
    token,
    expires_at: hoursFromNow(24),
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
    metadata: { platform },
  });

  await sendEmail({
    key: "v2:verifyEmail",
    userId: user.id,
    mail: email,
    payload: {
      lastName: user.last_name,
      token: buildVerificationLink("/verify-email", token, platform),
    },
  });

  return { already_verified: false as const };
}

/** Public: şifre sıfırlama maili. */
export async function forgotPassword(emailRaw: string, meta?: ClientMeta) {
  const email = emailRaw.toLowerCase();
  const user = await repo.findAuthProfileByEmail(email);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const platform = resolvePlatform(meta?.platform);
  const token = verification.generateToken();

  await verification.create({
    user_id: user.id,
    email,
    type: "password_reset",
    token,
    expires_at: hoursFromNow(1),
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
    metadata: { platform },
  });

  await sendEmail({
    key: "v2:passwordRecovery",
    userId: user.id,
    mail: email,
    payload: {
      lastName: user.last_name,
      token: buildVerificationLink("/change-password", token, platform),
    },
  });
}

/** Public: token ile şifre sıfırla. */
export async function resetPassword(token: string, newPassword: string) {
  const record = await verification.requireTokenRecord(
    token,
    "password_reset",
    {
      pendingOnly: true,
    },
  );
  await verification.assertNotExpired(record);
  if (!record.user_id) throw new AppError("INVALID_TOKEN");

  const hashed = await hash(newPassword, 10);
  await repo.updatePassword(record.user_id, hashed);
  await verification.markVerified(record.id);

  const user = await repo.findById(record.user_id);
  if (user?.email) {
    await sendEmail({
      key: "v2:passwordChanged",
      userId: user.id,
      mail: user.email,
      payload: { lastName: user.last_name },
    });
  }
}

/** Oturum: kurtarma e-postası talebi. */
export async function requestRecoveryEmail(
  userId: string,
  recoveryEmailRaw: string,
  meta?: ClientMeta,
) {
  const user = await repo.findById(userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const recoveryEmail = recoveryEmailRaw.toLowerCase();
  if (user.email && recoveryEmail === user.email.toLowerCase()) {
    throw new AppError("RECOVERY_EMAIL_SAME_AS_PRIMARY");
  }

  const clash = await repo.findIdByRecoveryEmail(recoveryEmail);
  if (clash && clash !== userId) {
    throw new AppError("RECOVERY_EMAIL_ALREADY_EXISTS");
  }

  const primaryClash = await repo.findIdByEmail(recoveryEmail);
  if (primaryClash && primaryClash !== userId) {
    throw new AppError("EMAIL_ALREADY_EXISTS");
  }

  await verification.cancelPending({ userId, type: "account_recovery" });

  const platform = resolvePlatform(meta?.platform);
  const token = verification.generateToken();

  await verification.create({
    user_id: userId,
    email: recoveryEmail,
    type: "account_recovery",
    token,
    expires_at: hoursFromNow(24),
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
    metadata: { platform, recovery_email: recoveryEmail },
  });

  await sendEmail({
    key: "v2:accountRecovery",
    userId,
    mail: recoveryEmail,
    payload: {
      lastName: user.last_name,
      token: buildVerificationLink("/verify-recovery-email", token, platform),
    },
  });
}

/** Public: kurtarma e-postasını doğrula. */
export async function verifyRecoveryEmail(token: string) {
  const record = await verification.requireTokenRecord(
    token,
    "account_recovery",
    { pendingOnly: true },
  );
  await verification.assertNotExpired(record);
  if (!record.user_id || !record.email) {
    throw new AppError("INVALID_TOKEN");
  }

  await repo.setRecoveryEmail(record.user_id, record.email);
  await verification.markVerified(record.id);

  return { user_id: record.user_id };
}

/** Oturum: kurtarma e-postasını kaldır. */
export async function removeRecoveryEmail(userId: string) {
  await repo.clearRecoveryEmail(userId);
}

/** Public: kurtarma e-postası ile şifre sıfırlama maili. */
export async function forgotPasswordRecovery(
  recoveryEmailRaw: string,
  meta?: ClientMeta,
) {
  const recoveryEmail = recoveryEmailRaw.toLowerCase();
  const user = await repo.findByVerifiedRecoveryEmail(recoveryEmail);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const platform = resolvePlatform(meta?.platform);
  const token = verification.generateToken();

  await verification.create({
    user_id: user.id,
    email: user.email,
    type: "password_reset",
    token,
    expires_at: hoursFromNow(1),
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
    metadata: { platform },
  });

  await sendEmail({
    key: "v2:passwordRecovery",
    userId: user.id,
    mail: recoveryEmail,
    payload: {
      lastName: user.last_name,
      token: buildVerificationLink("/change-password", token, platform),
    },
  });
}

/** Oturum: e-posta değişikliği talebi. */
export async function requestEmailChange(
  userId: string,
  newEmailRaw: string,
  meta?: ClientMeta,
) {
  const user = await repo.findById(userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const newEmail = newEmailRaw.toLowerCase();
  if (
    user.email &&
    newEmail === user.email.toLowerCase() &&
    user.email_verified_at
  ) {
    throw new AppError("EMAIL_UNCHANGED");
  }

  const clash = await repo.findIdByEmail(newEmail);
  if (clash && clash !== userId) {
    throw new AppError("EMAIL_ALREADY_EXISTS");
  }

  await verification.cancelPending({ userId, type: "email_change" });

  const platform = resolvePlatform(meta?.platform);
  const token = verification.generateToken();

  await verification.create({
    user_id: userId,
    email: newEmail,
    type: "email_change",
    token,
    expires_at: hoursFromNow(24),
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
    metadata: { platform },
  });

  await sendEmail({
    key: "v2:emailChange",
    userId,
    mail: newEmail,
    payload: {
      lastName: user.last_name,
      token: buildVerificationLink("/verify-email-change", token, platform),
    },
  });
}

/** Public: e-posta değişikliğini doğrula. */
export async function verifyEmailChange(token: string) {
  const record = await verification.requireTokenRecord(token, "email_change", {
    pendingOnly: true,
  });
  await verification.assertNotExpired(record);
  if (!record.user_id || !record.email) {
    throw new AppError("INVALID_TOKEN");
  }

  const user = await repo.findById(record.user_id);
  if (!user) throw new AppError("USER_NOT_FOUND");

  await repo.changeEmail(record.user_id, record.email, {
    activateIfInactive: !user.email_verified_at && user.status === "inactive",
  });
  await verification.markVerified(record.id);

  return { user_id: record.user_id };
}

function platformFromMeta(metadata: unknown): MailPlatform {
  if (
    metadata &&
    typeof metadata === "object" &&
    "platform" in metadata &&
    typeof (metadata as { platform: unknown }).platform === "string"
  ) {
    return resolvePlatform((metadata as { platform: string }).platform);
  }
  return "web";
}
