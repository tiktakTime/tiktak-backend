# permission (web)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`web/doc.md`](../doc.md)

**Dosyalar:** `permission.schema.ts`, `permission.routes.ts`, `domain/`  
**Base path:** `/organization/permission`  
**Mount:** `webRouter` → `authMiddleware`

---

## Amaç

Org özel veya sistem permission tanımları: arama, CRUD. Rol ilişkili liste ucu henüz stub.

---

## Endpoint'ler

| Method | Path                                 | tenant | policy              | HTTP | code                |
| ------ | ------------------------------------ | ------ | ------------------- | ---- | ------------------- |
| GET    | `/organization/permission/search`    | `org`  | `permission.get`    | 200  | (Page)              |
| GET    | `/organization/permission/{id}`      | `org`  | `permission.get`    | 200  | `permission.get`    |
| GET    | `/organization/permission/with/role` | `org`  | —                   | —    | **NOT IMPLEMENTED** |
| POST   | `/organization/permission`           | `org`  | `permission.post`   | 200  | `permission.create` |
| PATCH  | `/organization/permission/{id}`      | `org`  | `permission.patch`  | 200  | `permission.update` |
| DELETE | `/organization/permission/{id}`      | `org`  | `permission.delete` | 200  | `permission.delete` |

**Not:** `with/role` ucu `permission.get` policy **yapmaz** — yalnızca `tenant: "org"`.

---

## Schema özeti

| Schema                  | Alanlar                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PermissionCreate`      | `organization_id`, `slug`, `name`, `description?`, `is_locked?` — route ayrıca `tenantId` ile `insert` eder |
| `PermissionUpdate`      | `slug?`, `name?`, `description?`, `is_locked?`                                                              |
| `PermissionSchema`      | `id`, `organization_id`, `slug`, `name`, `description`, `is_locked`, timestamps                             |
| `PermissionSearchQuery` | pagination + `organization_id?`                                                                             |

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create, update, soft-delete, search.

---

## Modüller

`permission`, `role_permission`
