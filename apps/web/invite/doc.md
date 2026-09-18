# invite (web)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`web/doc.md`](../doc.md)

**Dosyalar:** `invite.schema.ts`, `invite.routes.ts`, `domain/`  
**Base path:** `/organization/invite`  
**Mount:** `webRouter` → `authMiddleware`

---

## Amaç

Org yöneticisi davet oluşturma, listeleme, yeniden gönderme ve iptal. Public accept: [`public/invite/doc.md`](../../public/invite/doc.md).

---

## Endpoint'ler

| Method | Path                               | tenant | policy         | HTTP | code             |
| ------ | ---------------------------------- | ------ | -------------- | ---- | ---------------- |
| GET    | `/organization/invite/search`      | `org`  | `invite.get`   | 200  | (Page)           |
| GET    | `/organization/invite/{id}`        | `org`  | `invite.get`   | 200  | `invite.get`     |
| POST   | `/organization/invite`             | `org`  | `invite.post`  | 200  | `invite.create`  |
| POST   | `/organization/invite/{id}/resend` | `org`  | `invite.post`  | 200  | `invite.resend`  |
| POST   | `/organization/invite/{id}/cancel` | `org`  | `invite.patch` | 200  | `invite.cancel`  |

---

## Schema özeti

| Alan / enum         | Değer                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| `InviteStatus`      | `pending`, `accepted`, `expired`, `canceled`                                                           |
| `InviteCreate`      | `person_id`, `description?`, `expires_at?`                                                             |
| `InviteSchema`      | `id`, `organization_id`, `person_id`, `email`, `status`, `expires_at`, `accepted_at`, `canceled_at`, … |
| `InviteSearchQuery` | pagination + `status?`                                                                                 |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create (token + mail), resend, cancel, search.

---

## Modüller

`invite`, `person`, `verification_code`, `platform/notifications` (+ `core/queue`)
