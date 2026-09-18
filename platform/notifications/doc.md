# notifications

Ürün bildirim sözleşmesi: mail şablon anahtarları, FE link üretimi, `MailJob`.

Barrel: `@/platform/notifications`

| Dosya         | Rol                                                        |
| ------------- | ---------------------------------------------------------- |
| `mail-job.ts` | `MailJob` (`key`, `mail`, `userId?`, `payload`)            |
| `links.ts`    | `buildVerificationLink`, `resolvePlatform`, `MailPlatform` |
| `send.ts`     | `sendEmail` → `core/queue.addMailJob`                      |

Mekanizma: `@/core/queue` (BullMQ). Fallback URL yok — env zorunlu.
