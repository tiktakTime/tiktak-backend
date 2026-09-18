# user (common)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`common/doc.md`](../doc.md)

**Dosyalar:** `user.schema.ts`, `user.routes.ts`, `domain/`  
**Base path:** `/user`  
**Mount:** `commonRouter` → `authMiddleware` (tüm uçlar)

---

## Amaç

Global kullanıcı hesabı CRUD. Org bağlamı gerekmez; hepsi `tenant: "member"`; liste/okuma ek `user.get` policy.

---

## Endpoint'ler

| Method | Path           | tenant   | policy     | HTTP | code          |
| ------ | -------------- | -------- | ---------- | ---- | ------------- |
| GET    | `/user/search` | `member` | `user.get` | 200  | (Page)        |
| GET    | `/user/{id}`   | `member` | `user.get` | 200  | `user.get`    |
| POST   | `/user`        | `member` | —          | 200  | `user.create` |
| PATCH  | `/user/{id}`   | `member` | —          | 200  | `user.update` |
| DELETE | `/user/{id}`   | `member` | —          | 200  | `user.delete` |

---

## Schema özeti

| Alan / enum                 | Değer                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `UserStatus`                | `active`, `inactive`, `blocked`                                                                  |
| `UserGender`                | `female`, `male`, `none`                                                                         |
| `UserSchema`                | Profil alanları (ad, email, telefon, vergi/sigorta, doğum, vb.) — **`password` response'ta yok** |
| `UserCreate` / `UserUpdate` | Çok sayıda opsiyonel profil alanı + `password` (create/update body)                              |
| `UserSearchQuery`           | `PaginationQuery` (Page)                                                                         |

**Kural:** `email` self-change `email-guard` ile engellenir (domain).

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create, update, search, soft-delete, email guard.

---

## Modüller

[`modules/user`](../../../modules/user/doc.md) · [`user_profile`](../../../modules/user_profile/doc.md) · [`user_identity`](../../../modules/user_identity/doc.md) · [`user_device`](../../../modules/user_device/doc.md)
