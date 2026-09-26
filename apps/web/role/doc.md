# role (web)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`web/doc.md`](../doc.md)

**Dosyalar:** `role.schema.ts`, `role.routes.ts`, `domain/`  
**Base path:** `/organization/role`  
**Mount:** `webRouter` → `authMiddleware`

---

## Amaç

Org rol tanımları ve (create/update'te) permission ataması. Permission'lı liste ucu henüz stub.

---

## Endpoint'ler

| Method | Path                                 | tenant | policy        | HTTP | code                |
| ------ | ------------------------------------ | ------ | ------------- | ---- | ------------------- |
| GET    | `/organization/role/search`          | `org`  | `role.get`    | 200  | (Page)              |
| GET    | `/organization/role/{id}`            | `org`  | `role.get`    | 200  | `role.get`          |
| GET    | `/organization/role/with/permission` | `org`  | —             | —    | **NOT IMPLEMENTED** |
| POST   | `/organization/role`                 | `org`  | `role.post`   | 200  | `role.create`       |
| PATCH  | `/organization/role/{id}`            | `org`  | `role.patch`  | 200  | `role.update`       |
| DELETE | `/organization/role/{id}`            | `org`  | `role.delete` | 200  | `role.delete`       |

**Not:** `with/permission` ucu `role.get` policy **yapmaz** — yalnızca `tenant: "org"`.

---

## Schema özeti

| Schema            | Alanlar                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `RoleCreate`      | `organization_id`, `name`, `slug?`, `description?`, `is_locked?`, `permissions?` (uuid[]) |
| `RoleUpdate`      | `name?`, `slug?`, `description?`, `is_locked?`, `permissions?`                            |
| `RoleSchema`      | `id`, `organization_id`, `slug`, `name`, `description`, `is_locked`, timestamps           |
| `RoleSearchQuery` | pagination + `organization_id?`                                                           |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create (permission sync), update, soft-delete, search.

---

## Modüller

`role`, `role_permission`, `permission`
