# role — domain

İndeks: [`apps/web/role/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `get.ts`, `search.ts`, `update.ts`, `soft-delete.ts`, `guards.ts`

---

## Zincir

| Endpoint                  | Guard | Domain           | Repo                          |
| ------------------------- | ----- | ---------------- | ----------------------------- |
| `GET .../search`          | org   | `searchRoles`    | `role.search`                 |
| `GET .../with/permission` | org   | (route)          | role + `role_permission` join |
| `POST .../`               | org   | `createRole`     | `role.insert`                 |
| `GET .../{id}`            | org   | `getRole`        | `role`                        |
| `PATCH .../{id}`          | org   | `updateRole`     | `role` + guard                |
| `DELETE .../{id}`         | org   | `softDeleteRole` | `role` + guard                |

---

## getRole `get.ts:5`

`findById` — yoksa `NOT_FOUND / role`.

## searchRoles `search.ts:5`

`repo.search(orgId, params)` — delege.

## createRole `create.ts:5`

`repo.insert(orgId, input)` — delege.

---

## assertRoleWritable `guards.ts:3`

1. `is_locked` → `FORBIDDEN / ROLE_LOCKED`.
2. `orgId` verildiyse ve `organization_id !== orgId` → `FORBIDDEN`.

Owner / sistem rolleri kilitli olabilir (`OWNER_ROLE_ID` vb.).

---

## updateRole `update.ts:8`

1. Yok → `NOT_FOUND / role`.
2. `assertRoleWritable(existing)` (yalnızca lock).
3. `repo.update`.

---

## softDeleteRole `soft-delete.ts:6`

1. Yok → `NOT_FOUND`.
2. `assertRoleWritable(existing, orgId)`.
3. `repo.softDelete`.

⚠ `role_permission` satırları otomatik temizlenmeyebilir — repo davranışına bak.
