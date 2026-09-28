# auth

İndeks: [`apps/doc.md`](../doc.md)

**Dosyalar:** `index.ts`, `auth.routes.ts`, `routes/`, `utils/`  
**Mount:** surfaces dışı, yol `/auth/...`  
**Auth:** açık uçlar bearer istemez; kalanına `authMiddleware`  
**Handle:** her uç `routes/` altında kendi paketinde (şema + iş). `GET /auth/switch/{id}` henüz yok.

Oturum işlemleri tüm cihazlarda bu tek kayıttadır. Web ve mobile kopyası yoktur.

---

## Endpoint'ler

| Method | Path                             | Guard             |
| ------ | -------------------------------- | ----------------- |
| POST   | `/auth/sign-in`                  | `rate_limit.auth` |
| POST   | `/auth/sign-up`                  | —                 |
| POST   | `/auth/verify-email`             | —                 |
| POST   | `/auth/forgot-password`          | —                 |
| POST   | `/auth/forgot-password-recovery` | —                 |
| POST   | `/auth/reset-password`           | —                 |
| POST   | `/auth/recovery-email/verify`    | —                 |
| POST   | `/auth/email-change/verify`      | —                 |
| POST   | `/auth/verify-email/request`     | `authMiddleware`  |
| POST   | `/auth/change-password`          | `authMiddleware`  |
| POST   | `/auth/recovery-email/request`   | `authMiddleware`  |
| DELETE | `/auth/recovery-email`           | `authMiddleware`  |
| POST   | `/auth/email-change/request`     | `authMiddleware`  |
| POST   | `/auth/logout`                   | `authMiddleware`  |
| GET    | `/auth/member`                   | `authMiddleware`  |
| GET    | `/auth/switch/{id}`              | `authMiddleware`  |

Route `name` biçimi: `auth.<method>.<path>` — örnek `auth.post.auth.sign-in`.
