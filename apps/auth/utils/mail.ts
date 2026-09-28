import {
  buildVerificationLink,
  resolvePlatform,
  sendEmail,
} from "@/platform/notifications";

import type { AuthRequest } from "./request";

/** Kuyruk hatası hesabı geri almaz. Token satırı zaten yazılmıştır. */
export async function sendAuthMail(input: {
  key: string;
  mail: string;
  userId: string;
  lastName: string;
  path: string;
  token: string;
  request?: AuthRequest;
}): Promise<void> {
  try {
    await sendEmail({
      key: input.key,
      mail: input.mail,
      userId: input.userId,
      payload: {
        lastName: input.lastName,
        token: buildVerificationLink(
          input.path,
          input.token,
          resolvePlatform(input.request?.platform),
        ),
      },
    });
  } catch (error) {
    console.error("[auth] e-posta gönderilemedi:", error);
  }
}
