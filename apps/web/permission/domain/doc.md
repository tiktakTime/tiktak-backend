# permission — domain

İndeks: [`apps/web/permission/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `get.ts`, `search.ts`, `update.ts`, `soft-delete.ts`, `guards.ts`

---

## Zincir

| Endpoint            | Guard | Domain                 | Repo                               |
| ------------------- | ----- | ---------------------- | ---------------------------------- |
| `GET .../search`    | org   | `searchPermissions`    | `permission.search`                |
| `GET .../with/role` | org   | (route)                | ⚠ çoğu route’ta liste; domain ince |
| `POST .../`         | org   | `createPermission`     | `permission`                       |
| `GET .../{id}`      | org   | `getPermission`        | `permission`                       |
| `PATCH .../{id}`    | org   | `updatePermission`     | `permission` + guard               |
| `DELETE .../{id}`   | org   | `softDeletePermission` | `permission` + guard               |

---

## getPermission `get.ts:5`

`findById` — yoksa `NOT_FOUND / permission`.

## searchPermissions `search.ts:5`

`repo.search(orgId, params)` — delege.

---

## assertPermissionWritable `guards.ts:3`

1. `is_locked` → `FORBIDDEN / PERMISSION_LOCKED`.
2. `orgId` verildiyse ve `organization_id !== orgId` → `FORBIDDEN` (kod mesajı yok).

Global / kilitli permission’lar org tarafından değiştirilemez.

---

## createPermission `create.ts:7`

**Adımlar**

1. `findGlobalBySlug(input.slug)` dolu → `CONFLICT / PERMISSION_SLUG_EXISTS_GLOBAL`.
2. `repo.insert(orgId, input)`.

Org içi slug çakışması repo/DB’ye bırakılır.

---

## updatePermission `update.ts:8`

1. Yok → `NOT_FOUND`.
2. `assertPermissionWritable(existing)` — orgId **geçilmez** (yalnızca lock kontrolü).
3. `repo.update`.

---

## softDeletePermission `soft-delete.ts:6`

1. Yok → `NOT_FOUND`.
2. `assertPermissionWritable(existing, orgId)` — lock **ve** org sahipliği.
3. `repo.softDelete`.
