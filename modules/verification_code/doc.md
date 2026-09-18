# verification_code

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `verification_code`  
**Dosyalar:** `verification_code.prisma`, `enums.prisma`, `verification_code.repo.ts`  
**Tür:** Entity — tek kullanımlık doğrulama token / kod deposu.

**Soft-delete:** Yok — durum `status` enum ile yönetilir (`pending` → `verified` / `expired` / `cancelled`).

---

## Amaç

E-posta doğrulama, şifre sıfırlama, e-posta değişimi, kurtarma, 2FA, davet vb. için ortak kayıt. Domain akışları [`apps/auth/domain/email-flows.ts`](../../apps/auth/domain/doc.md) üzerinden bu repo'yu kullanır.

---

## Alanlar

| Alan                        | Tip                      | Null     | Açıklama                      |
| --------------------------- | ------------------------ | -------- | ----------------------------- |
| `id`                        | uuid                     | PK       |                               |
| `organization_id`           | uuid                     | ✓        | Bağlam (opsiyonel)            |
| `user_id`                   | uuid                     | ✓        | Hedef kullanıcı               |
| `type`                      | `VerificationCodeType`   |          | Akış türü                     |
| `email` / `phone`           | varchar                  | ✓        | Hedef kanal                   |
| `code`                      | varchar(10)              | ✓        | Kısa OTP                      |
| `token`                     | varchar(255)             | ✓ unique | Uzun token (link)             |
| `status`                    | `VerificationCodeStatus` |          | `pending` default             |
| `expires_at`                | timestamptz              |          | Zorunlu süre                  |
| `used_at`                   | timestamptz              | ✓        | Doğrulama anı                 |
| `attempts` / `max_attempts` | int                      |          | Deneme limiti (default max 5) |
| `ip_address` / `user_agent` |                          | ✓        | İstemci meta                  |
| `metadata`                  | json                     | ✓        | Ek bağlam                     |
| `created_at` / `updated_at` | timestamptz              |          |                               |

---

## Enum'lar

**VerificationCodeType:**  
`register`, `invite`, `access_confirm`, `password_reset`, `email_change`, `two_factor`, `phone_verification`, `account_recovery`, `login_verification`

**VerificationCodeStatus:**  
`pending`, `verified`, `expired`, `cancelled`

Export sabitleri: `VERIFICATION_TYPES`, `VERIFICATION_STATUSES`.

---

## İndeksler

email, phone, code, type, status, org, user, expires_at; composite `(email, type, status)`; unique `token`.

---

## Repo yüzeyi (`verification_code.repo.ts`)

| Fonksiyon            | Davranış                             | Parametreler                                                                 | Hata / not                                                   |
| -------------------- | ------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `generateToken`      | `uuid + randomBytes(16 hex)`         | —                                                                            | Senkron                                                      |
| `findByToken`        | Token + type ile kayıt               | `token`, `type`, `status?`                                                   | Opsiyonel status filtresi                                    |
| `create`             | Yeni pending kayıt                   | user_id?, org_id?, email?, type, token, expires_at, ip, user_agent, metadata | `status: pending`                                            |
| `cancelPending`      | Aynı user+type pending → `cancelled` | `{ userId, type }`                                                           | Yeni kod öncesi temizlik                                     |
| `markVerified`       | `status: verified`, `used_at: now`   | `id`                                                                         |                                                              |
| `markExpired`        | `status: expired`                    | `id`                                                                         |                                                              |
| `requireTokenRecord` | Kayıt bul; yoksa hata fırlat         | `token`, `type`, `{ pendingOnly? }`                                          | **`AppError BAD_REQUEST INVALID_TOKEN`**                     |
| `assertNotExpired`   | `expires_at < now` ise expire + hata | `record`                                                                     | **`AppError BAD_REQUEST TOKEN_EXPIRED`**; önce `markExpired` |

### Tipik akış (domain)

1. `cancelPending` — eski pending iptal.
2. `generateToken` + `create` — yeni kayıt.
3. Link tıklanınca: `requireTokenRecord` → `assertNotExpired` → iş mantığı → `markVerified`.

---

## Tüketiciler

| Domain                                              | Dosyalar         | Kullanım                                                                       |
| --------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md) | `email-flows.ts` | Kayıt verify, password reset, recovery, email-change; `user.repo` ile birlikte |

İlgili modül: [`user`](../user/doc.md) (`markEmailVerified`, `updatePassword`, `changeEmail`).
