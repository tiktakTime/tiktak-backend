# user — domain

İndeks: [`apps/common/user/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `get.ts`, `search.ts`, `update.ts`, `soft-delete.ts`, `email-guard.ts`

Profil CRUD. E-posta doğrulama / şifre akışları [`apps/auth/domain/doc.md`](../../../auth/domain/doc.md).

---

## Zincir

| Endpoint            | tenant   | policy     | Domain           | Repo                        |
| ------------------- | -------- | ---------- | ---------------- | --------------------------- |
| `GET /user/search`  | `member` | `user.get` | `searchUsers`    | `user.search`               |
| `GET /user/{id}`    | `member` | `user.get` | `getUser`        | `user.findById`             |
| `POST /user`        | `member` | —          | `createUser`     | `user.create`               |
| `PATCH /user/{id}`  | `member` | —          | `updateUser`     | `user.update` + email-guard |
| `DELETE /user/{id}` | `member` | —          | `softDeleteUser` | `user.softDelete`           |

---

## getUser `get.ts:5`

`findById` — yoksa `NOT_FOUND / user`.

## searchUsers `search.ts:5`

`repo.search(params)` — delege.

## softDeleteUser `soft-delete.ts:5`

`repo.softDelete` — yoksa `NOT_FOUND / user`.

⚠ Bağlı access/person cascade yok.

---

## createUser `create.ts:5`

`repo.create`. `gender` yalnızca `female|male|none`; şemadaki diğer değerler → `"none"` (DB enum uyumu).

---

## assertSelfEmailChangeAllowed `email-guard.ts:4`

Session user kendi kaydında `email` alanı gönderirse → `BAD_REQUEST / EMAIL_CHANGE_REQUIRES_VERIFICATION`.

Kural: e-posta değişimi `/auth/email-change/*` ile yapılır; profil PATCH ile değil.

---

## updateUser `update.ts:8`

**Adımlar**

1. `assertSelfEmailChangeAllowed(sessionUserId, id, input.email)`.
2. `repo.update` — yoksa `NOT_FOUND / user`.

Başka alanlar (isim, telefon, …) serbest; email yalnızca **başkasını** güncellerken (admin) veya hiç gönderilmeden.
