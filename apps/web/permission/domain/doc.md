# permission — domain

İndeks: [`apps/web/permission/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `get.ts`, `search.ts`, `update.ts`, `soft-delete.ts`

---

## Zincir

| Endpoint            | Guard | Domain                 | Repo                               |
| ------------------- | ----- | ---------------------- | ---------------------------------- |
| `GET .../search`    | org   | `searchPermissions`    | `permission.search`                |
| `GET .../with/role` | org   | (route)                | ⚠ çoğu route’ta liste; domain ince |
| `POST .../`         | org   | `createPermission`     | `permission`                       |
| `GET .../{id}`      | org   | `getPermission`        | `permission`                       |
| `PATCH .../{id}`    | org   | `updatePermission`     | `permission`                       |
| `DELETE .../{id}`   | org   | `softDeletePermission` | `permission`                       |

---

## getPermission `get.ts:5`

`findById(orgId, id)` — yoksa `NOT_FOUND / permission`. Global satır repoda görünür.

## searchPermissions `search.ts:5`

`repo.search(orgId, params)` — delege.

---

## createPermission `create.ts:7`

**Adımlar**

1. `findGlobalBySlug(input.slug)` dolu → `CONFLICT / PERMISSION_SLUG_EXISTS_GLOBAL`.
2. `repo.insert(orgId, input)`.

Org içi slug çakışması repo/DB’ye bırakılır.

---

## updatePermission `update.ts:8`

1. Yok → `NOT_FOUND`.
2. `is_locked` → `PERMISSION_LOCKED`.
3. `repo.update(orgId, id)` — başka org ve global satır eşleşmez.

---

## softDeletePermission `soft-delete.ts:6`

1. Yok → `NOT_FOUND`.
2. `is_locked` → `PERMISSION_LOCKED`.
3. `repo.softDelete(orgId, id)`.
