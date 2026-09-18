# access (web)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`web/doc.md`](../doc.md)

**Dosyalar:** `access.schema.ts`, `access.routes.ts`, `domain/`  
**Base path:** `/organization/access`  
**Mount:** `webRouter` → `authMiddleware`

---

## Amaç

Kullanıcı ↔ organizasyon üyelik (`access`) satırları: arama, CRUD, upsert. Hard delete; session revoke domain'de.

---

## Endpoint'ler

| Method | Path                                 | tenant   | policy            | HTTP | code            |
| ------ | ------------------------------------ | -------- | ----------------- | ---- | --------------- |
| GET    | `/organization/access/search`        | `member` | —                 | 200  | (Page)          |
| GET    | `/organization/access/{id}`          | `member` | —                 | 200  | `access.get`    |
| PATCH  | `/organization/access/upsert-access` | `none`   | `access.patch`    | 200  | `access.upsert` |
| POST   | `/organization/access`               | `none`   | `access.post`     | 200  | `access.create` |
| PATCH  | `/organization/access/{id}`          | `none`   | `access.patch`    | 200  | `access.update` |
| DELETE | `/organization/access/{id}`          | `none`   | `access.delete`   | 200  | `access.delete` |

**Not:** `search` / `get` org tenant kullanmaz — `actorId` (session `user_id`) ile kendi üyeliklerini listeler. Mutation’larda tenant default `none`.

---

## Schema özeti

| Alan / enum         | Değer                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------- |
| `AccessStatus`      | `pending`, `active`, `inactive`, `blocked`, `canceled`                                 |
| `AccessCreate`      | `organization_id`, `user_id`, `person_id?`, `status?`, `description?`, `expired_date?` |
| `AccessUpdate`      | `user_id?`, `person_id?`, `status?`, `description?`, `expired_date?`                   |
| `AccessCreate`      | `upsert` ucu da bu şemayı kullanır (ayrı `AccessUpsert` yok)                           |
| `AccessSearchQuery` | pagination + `organization_id?`, `status?`                                             |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create, update, upsert, remove, search.

---

## Modüller

[`modules/access`](../../../modules/access/doc.md)
