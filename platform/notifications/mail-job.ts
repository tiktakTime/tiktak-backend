/** Ürün mail iş sözleşmesi — queue’ya `platform/notifications` üzerinden girer. */
export type MailJob = {
  /** Şablon anahtarı — örn. `v2:verifyEmail`, `v2:invite`. */
  key: string;
  /** Alıcı e-posta. */
  mail: string;
  userId?: string | null;
  payload: Record<string, unknown>;
};
