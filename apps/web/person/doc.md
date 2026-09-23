# person (web)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`web/doc.md`](../doc.md)

**Dosyalar:** `person.schema.ts`, `person.routes.ts`, `domain/`  
**Base path:** `/organization/person`  
**Mount:** `webRouter` → `authMiddleware`

---

## Amaç

Org kişi kaydı CRUD. Çoğu uç `tenant: "org"` + `person.*` policy; delete handler `actorId` alır (audit), ayrı `member` tenant yok.

---

## Endpoint'ler (implemente)

| Method | Path                                | tenant | policy          | HTTP | code             |
| ------ | ----------------------------------- | ------ | --------------- | ---- | ---------------- |
| GET    | `/organization/person/search`       | `org`  | `person.get`    | 200  | (Page)           |
| GET    | `/organization/person/{id}`         | `org`  | `person.get`    | 200  | `person.get`     |
| POST   | `/organization/person`              | `org`  | `person.post`   | 200  | `person.create`  |
| PATCH  | `/organization/person/{id}`         | `org`  | `person.patch`  | 200  | `person.update`  |
| PATCH  | `/organization/person/{id}/restore` | `org`  | `person.patch`  | 200  | `person.restore` |
| DELETE | `/organization/person/{id}`         | `org`  | `person.delete` | 200  | `person.delete`  |

## Endpoint'ler (stub — NOT IMPLEMENTED)

| Method | Path                                        | tenant |
| ------ | ------------------------------------------- | ------ |
| GET    | `/organization/person/search-with-user`     | `org`  |
| GET    | `/organization/person/dashboard`            | `org`  |
| GET    | `/organization/person/compare-with-user`    | `org`  |
| POST   | `/organization/person/match-with-user`      | `org`  |
| GET    | `/organization/person/{id}/role-permission` | `org`  |
| PATCH  | `/organization/person/{id}/role-permission` | `org`  |

---

## Schema özeti

| Alan / enum                     | Değer                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `PersonStatus`                  | `active`, `inactive`, `blocked`                                              |
| `PersonGender`                  | `female`, `male`, `other`, `none` (API'de `other` var; user'da yok)          |
| `PersonCreate` / `PersonUpdate` | Org bağlantıları + profil alanları (user benzeri)                            |
| `PersonSchema`                  | `organization_id`, `user_id?`, `role_id?`, `employee_id?`, profil + `status` |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create, update, restore, soft-delete, search.

---

## Modüller

`person`, `role`, `person_permission`
