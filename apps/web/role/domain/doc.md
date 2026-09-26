# role — domain

İndeks: [`apps/web/role/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `get.ts`, `search.ts`, `update.ts`, `soft-delete.ts`

---

## Zincir

| Endpoint                  | Guard | Domain           | Repo                          |
| ------------------------- | ----- | ---------------- | ----------------------------- |
| `GET .../search`          | org   | `searchRoles`    | `role.search`                 |
| `GET .../with/permission` | org   | (route)          | role + `role_permission` join |
| `POST .../`               | org   | `createRole`     | `role.insert`                 |
| `GET .../{id}`            | org   | `getRole`        | `role`                        |
| `PATCH .../{id}`          | org   | `updateRole`     | `role`                        |
| `DELETE .../{id}`         | org   | `softDeleteRole` | `role`                        |

---

## getRole `get.ts:5`

`findById(orgId, id)` — yoksa `NOT_FOUND / role`. Global satır repoda görünür.

## searchRoles `search.ts:5`

`repo.search(orgId, params)` — delege.

## createRole `create.ts:5`

`repo.insert(orgId, input)` — delege.

---

## updateRole `update.ts:8`

1. Yok → `NOT_FOUND / role`.
2. `is_locked` → `ROLE_LOCKED`.
3. `repo.update(orgId, id)` — başka org ve global satır eşleşmez.

---

## softDeleteRole `soft-delete.ts:6`

1. Yok → `NOT_FOUND`.
2. `is_locked` → `ROLE_LOCKED`.
3. `repo.softDelete(orgId, id)`.

⚠ `role_permission` satırları otomatik temizlenmeyebilir — repo davranışına bak.
