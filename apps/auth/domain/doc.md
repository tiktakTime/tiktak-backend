# auth — domain

İndeks: [`apps/auth/doc.md`](../doc.md) · [`apps/doc.md`](../../doc.md)

Kaynaklar: `authenticate.ts`, `oauth.ts`, `issue-session.ts`, `email-flows.ts`, `switch-organization.ts`, `resolve-permissions.ts`

Kimlik ve e-posta akışları. Token motoru [`platform/auth`](../../../platform/auth/doc.md); bu katman kullanıcı / verification_code kurallarını uygular.

---

## Zincir (endpoint → guard → domain → repo)

| Endpoint                              | Guard             | Domain                                           | Repo / motor                                                                  |
| ------------------------------------- | ----------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `POST /auth/sign-in`                  | `rate_limit.auth` | `authenticateUser` → route `issueSessionForUser` | `user.findAuthByEmail` · domain `issueSessionForUser` → `platform/auth`       |
| `POST /auth/oauth`                    | `rate_limit.auth` | `resolveOAuthUser` → route `issueSessionForUser` | `user` / `user_identity` · `platform/auth`                                    |
| `POST /auth/sign-up`                  | —                 | `signUpUser`                                     | `user` · `verification_code` · `platform/notifications`                       |
| `POST /auth/verify-email`             | —                 | `verifyEmail`                                    | `verification_code` · `user`                                                  |
| `POST /auth/forgot-password`          | —                 | `forgotPassword`                                 | aynı                                                                          |
| `POST /auth/reset-password`           | —                 | `resetPassword`                                  | aynı                                                                          |
| `POST /auth/recovery-email/verify`    | —                 | `verifyRecoveryEmail`                            | aynı                                                                          |
| `POST /auth/forgot-password-recovery` | —                 | `forgotPasswordRecovery`                         | aynı                                                                          |
| `POST /auth/email-change/verify`      | —                 | `verifyEmailChange`                              | aynı                                                                          |
| `POST /auth/refresh`                  | `rate_limit.auth` | (route) `rotateRefreshToken`                     | `platform/auth`                                                               |
| `POST /auth/verify-email/request`     | `authMiddleware`  | `requestEmailVerification`                       | `user` · `verification_code` · `platform/notifications`                       |
| `POST /auth/change-password`          | `authMiddleware`  | (route inline)                                   | `user` doğrudan Kysely                                                        |
| `POST /auth/recovery-email/request`   | `authMiddleware`  | `requestRecoveryEmail`                           | …                                                                             |
| `DELETE /auth/recovery-email`         | `authMiddleware`  | `removeRecoveryEmail`                            | `user.clearRecoveryEmail`                                                     |
| `POST /auth/email-change/request`     | `authMiddleware`  | `requestEmailChange`                             | …                                                                             |
| `POST /auth/logout`                   | `authMiddleware`  | (route) `revokeSession`                          | `platform/auth`                                                               |
| `GET /auth/member`                    | `authMiddleware`  | (route inline)                                   | `user` select                                                                 |
| `GET /auth/switch/{id}`               | `authMiddleware`  | `switchOrganization`                             | `access` · `person` · `role_permission` · `platform/auth.updateSessionFields` |

⚠ `change-password` ve `member` domain’e taşınmamış — mantık `apps/auth/index.ts` içinde.

---

## authenticate.ts

### authenticateUser `authenticate.ts:8`

E-posta + şifre doğrular; oturum açmak için `{ id }` döner.

**Adımlar**

1. `user = userRepo.findAuthByEmail(email.toLowerCase())`.
2. Kullanıcı yok veya `deleted_at` dolu → `UNAUTHORIZED / invalid_credentials`.
3. `status !== "active"` → `FORBIDDEN / USER_INACTIVE`.
4. `password` null → `UNAUTHORIZED / invalid_credentials`.
5. `bcrypt.compare(password, user.password)` başarısız → aynı hata.
6. Dönüş: `{ id: user.id }`.

**Hatalar:** `invalid_credentials` (yanlış/eksik/silinmiş), `USER_INACTIVE`.

**Yan etki:** yok. Session route’ta `issueSessionForUser` ile açılır.

---

## resolve-permissions.ts

### resolvePermissionSlugs `resolve-permissions.ts:13`

Role’ün permission slug listesini döner.

**Adımlar**

1. `roleId` yoksa `[]`.
2. `rolePermissionRepo.listPermissionSlugsForRole({ organizationId, roleId })`.

⚠ `personId` parametresi alınır ama **kullanılmaz**. `person_permission` override henüz bağlanmadı.

---

## switch-organization.ts

### switchOrganization `switch-organization.ts:10`

Aktif oturumu başka org’a taşır; permission’ları session’a yazar.

**Girdi:** `userId`, `sessionId`, `organizationId` (hepsi zorunlu).

**Adımlar**

1. `access = accessRepo.findByUserOrg(userId, organizationId)` — yoksa `NOT_FOUND / access`.
2. `access.status !== "active"` → `FORBIDDEN / ACCESS_INACTIVE`.
3. Person: `access.person_id` varsa `personRepo.findById`, yoksa `findActiveByUserId`.
4. Person var ve `status !== "active"` → `FORBIDDEN / ACCESS_INACTIVE`.
5. `roleId = person?.role_id ?? access.role_id ?? null`.
6. `personId = person?.id ?? access.person_id ?? null`.
7. `permissions = resolvePermissionSlugs({ organizationId, roleId, personId })`.
8. `updateSessionFields(sessionId, { organization_id, person_id, role_id, permissions })`.
9. `user = userRepo.findById(userId)` — yoksa `NOT_FOUND / user`.
10. Dönüş: member benzeri özet (`user_id`, `session_id`, org alanları, `email`, isimler, `permissions`).

**Yan etki:** Redis session güncellenir.

---

## email-flows.ts — yardımcılar

### hoursFromNow `email-flows.ts:14` (iç)

`Date.now() + hours * 3600_000`.

### platformFromMeta `email-flows.ts:379` (iç)

`metadata.platform` string ise `resolvePlatform`, değilse `"web"`.

### ClientMeta

`platform?`, `ip?`, `userAgent?` — mail/token kaydına yazılır.

---

## email-flows.ts — kayıt / doğrulama

### signUpUser `email-flows.ts:25`

Yeni kullanıcı: inactive + register token + verify mail.

**Adımlar**

1. `email = input.email.toLowerCase()`.
2. `findIdByEmail` dolu → `CONFLICT / EMAIL_ALREADY_EXISTS`.
3. `bcrypt.hash(password, 10)`.
4. `createAuthUser` — `status: "inactive"`, `email_verified_at: null`.
5. `generateToken()` + `verification.create` type `"register"`, TTL **24 saat**, metadata `{ platform }`.
6. `sendEmail` key `v2:verifyEmail`, link `/verify-email`.
7. Dönüş: `user` satırı.

**Transaction:** yok — user yazıldıktan sonra token/mail fail olabilir (⚠).

---

### verifyEmail `email-flows.ts:74`

Register token ile e-postayı doğrular; kullanıcıyı aktif eder (`markEmailVerified`).

**Adımlar**

1. `requireTokenRecord(token, "register")`.
2. `user_id` varsa user yükle.
3. Token `verified` **ve** user zaten `email_verified_at` → idempotent başarı `{ user_id, platform }`.
4. Token `verified` ama user doğrulanmamış → `BAD_REQUEST / INVALID_TOKEN`.
5. Status `pending` değilse → `INVALID_TOKEN`.
6. `assertNotExpired` (süresi dolmuşsa repo expired işaretler).
7. `user_id` yoksa → `INVALID_TOKEN`.
8. `markEmailVerified(user_id)` + `markVerified(record.id)`.
9. Dönüş: `{ user_id, platform }`.

---

### requestEmailVerification `email-flows.ts:109`

Oturumlu kullanıcıya verify mailini yeniden gönderir.

**Adımlar**

1. User yok → `NOT_FOUND / USER_NOT_FOUND`.
2. Zaten verified → `{ already_verified: true }` (mail yok).
3. `cancelPending({ userId, type: "register" })`.
4. Yeni token (24s) + mail `v2:verifyEmail`.
5. `{ already_verified: false }`.

---

## email-flows.ts — şifre

### forgotPassword `email-flows.ts:151`

**Adımlar:** email lower → `findAuthProfileByEmail` yoksa `USER_NOT_FOUND` → token type `password_reset` TTL **1 saat** → mail `v2:passwordRecovery` link `/change-password`.

⚠ Kullanıcı yokken `USER_NOT_FOUND` dönülüyor — e-posta enumeration mümkün.

---

### resetPassword `email-flows.ts:182`

**Adımlar**

1. `requireTokenRecord(..., "password_reset", { pendingOnly: true })`.
2. `assertNotExpired`; `user_id` zorunlu.
3. Hash yeni şifre → `updatePassword` → `markVerified`.
4. User varsa bilgilendirme maili `v2:passwordChanged`.

---

### forgotPasswordRecovery `email-flows.ts:279`

Kurtarma e-postası ile aynı `password_reset` akışı; kullanıcı `findByVerifiedRecoveryEmail`. Mail **recovery** adresine gider; token kaydında `email` alanı primary user email.

---

## email-flows.ts — kurtarma e-postası

### requestRecoveryEmail `email-flows.ts:205`

**Adımlar**

1. User yok → `USER_NOT_FOUND`.
2. Recovery === primary → `RECOVERY_EMAIL_SAME_AS_PRIMARY`.
3. Başka kullanıcıda recovery → `RECOVERY_EMAIL_ALREADY_EXISTS`.
4. Başka kullanıcıda primary → `EMAIL_ALREADY_EXISTS`.
5. `cancelPending` type `account_recovery`.
6. Token 24s; metadata `{ platform, recovery_email }`; mail `v2:accountRecovery` → `/verify-recovery-email`.

---

### verifyRecoveryEmail `email-flows.ts:256`

Pending `account_recovery` token → `setRecoveryEmail(user_id, record.email)` → `markVerified`.

---

### removeRecoveryEmail `email-flows.ts:274`

`clearRecoveryEmail(userId)`. Hata yok (idempotent).

---

## email-flows.ts — e-posta değişikliği

### requestEmailChange `email-flows.ts:313`

**Adımlar**

1. User yok → `USER_NOT_FOUND`.
2. Yeni email === mevcut **ve** verified → `EMAIL_UNCHANGED`.
3. Başka kullanıcıda email → `EMAIL_ALREADY_EXISTS`.
4. `cancelPending` type `email_change`.
5. Token 24s; mail `v2:emailChange` yeni adrese → `/verify-email-change`.

---

### verifyEmailChange `email-flows.ts:359`

**Adımlar**

1. Pending `email_change` + not expired; `user_id` + `email` zorunlu.
2. User yok → `USER_NOT_FOUND`.
3. `changeEmail(user_id, newEmail, { activateIfInactive: !verified && status===inactive })` — inactive kayıtlı kullanıcıyı da aktive edebilir.
4. `markVerified`.

---

## Token TTL özeti

| Type                                             | Saat |
| ------------------------------------------------ | ---- |
| `register` / `account_recovery` / `email_change` | 24   |
| `password_reset`                                 | 1    |
