# auth

İndeks: [`apps/doc.md`](../doc.md)

**Dosyalar:** `index.ts` (routes), `auth.schema.ts`, `domain/`  
**Mount:** surfaces **dışı** — `server` doğrudan `mount(authRouter)`  
**Auth:** melez — public uçlar + `authMiddleware` korumalı session uçları

---

## Amaç

Kimlik ve oturum: sign-in/up, e-posta doğrulama, şifre/recovery/email change, token refresh, logout, aktif üye bilgisi (`member`), org switch. Token motoru: [`platform/auth`](../../platform/auth/doc.md).

---

## Endpoint'ler

| Method | Path                             | Guard             | HTTP | name                            |
| ------ | -------------------------------- | ----------------- | ---- | ------------------------------- |
| POST   | `/auth/sign-in`                  | `rate_limit.auth` | 200  | `auth.sign-in`                  |
| POST   | `/auth/oauth`                    | `rate_limit.auth` | 200  | `auth.oauth`                    |
| POST   | `/auth/sign-up`                  | —                 | 200  | `auth.sign-up`                  |
| POST   | `/auth/verify-email`             | —                 | 200  | `auth.verify-email`             |
| POST   | `/auth/forgot-password`          | —                 | 200  | `auth.forgot-password`          |
| POST   | `/auth/reset-password`           | —                 | 200  | `auth.reset-password`           |
| POST   | `/auth/recovery-email/verify`    | —                 | 200  | `auth.recovery-email.verify`    |
| POST   | `/auth/forgot-password-recovery` | —                 | 200  | `auth.forgot-password-recovery` |
| POST   | `/auth/email-change/verify`      | —                 | 200  | `auth.email-change.verify`      |
| POST   | `/auth/refresh`                  | `rate_limit.auth` | 200  | `auth.refresh`                  |
| POST   | `/auth/verify-email/request`     | `authMiddleware`  | 200  | `auth.verify-email.request`     |
| POST   | `/auth/change-password`          | `authMiddleware`  | 200  | `auth.change-password`          |
| POST   | `/auth/recovery-email/request`   | `authMiddleware`  | 200  | `auth.recovery-email.request`   |
| DELETE | `/auth/recovery-email`           | `authMiddleware`  | 200  | `auth.recovery-email.remove`    |
| POST   | `/auth/email-change/request`     | `authMiddleware`  | 200  | `auth.email-change.request`     |
| POST   | `/auth/logout`                   | `authMiddleware`  | 200  | `auth.logout`                   |
| GET    | `/auth/member`                   | `authMiddleware`  | 200  | `auth.member`                   |
| GET    | `/auth/switch/{id}`              | `authMiddleware`  | 200  | `auth.switch`                   |

Rotalar `defineRoute` + `createSlice`; rate-limit ve `authMiddleware` dış `authRouter.use(...)` ile path bazlı.

**Notlar:**

- `sign-in`: body `email` + `password` → `authenticateUser` sonra route içinde `issueSessionForUser` → `TokenPair`
- `change-password` ve `member`: domain yerine **inline** handler (`index.ts`)
- `switch/{id}`: `switchOrganization` domain

---

## Schema özeti

| Schema               | Alanlar / kısıt                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `SignInBody`         | `email`, `password`                                                                                                          |
| `SignUpBody`         | `first_name`, `last_name`, `email`, `password` (min 6)                                                                       |
| `ResetPasswordBody`  | `token`, `new_password` (min 6)                                                                                              |
| `ChangePasswordBody` | `current_password`, `new_password` (min 6)                                                                                   |
| `RefreshBody`        | `refresh_token`                                                                                                              |
| `TokenPair`          | `access_token`, `refresh_token`, `token_type` (`Bearer`), `expires_in`                                                       |
| `Member`             | `user_id`, `session_id`, `organization_id?`, `person_id?`, `role_id?`, `permissions?`, `email?`, `first_name?`, `last_name?`, `picture?` |
| Token body'ler       | `VerifyEmail`, `ForgotPassword`, `RecoveryEmail*`, `EmailChange*` — `token` veya `email` / `recovery_email`                  |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — sign-up, authenticate, email/recovery flows, org switch, permission resolve.

---

## Modüller

`user`, `access`, `verification_code`, `role_permission`, `platform/notifications`, `platform/auth`
