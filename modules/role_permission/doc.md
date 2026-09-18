# role_permission

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `role_permission`  
**Dosyalar:** `role_permission.prisma`, `role_permission.repo.ts`  
**Tür:** Junction — rol ↔ izin.

**Soft-delete:** Yok — satırlar hard delete (`deleteById`, `replaceForRole` önce siler).  
**Kardeş / SQL:** `listPermissionSlugsForRole` `permission` tablosuna SQL `INNER JOIN` yapar; TypeScript import da serbest.

---

## Amaç

Bir role hangi permission'ların bağlı olduğunu tutar. `organization_id` null ise global bağ; doluysa org kapsamı. Hem junction hem permission satırının org/global kapsamı JOIN'de doğrulanır.

---

## Alanlar

| Alan                        | Tip         | Null | Açıklama          |
| --------------------------- | ----------- | ---- | ----------------- |
| `id`                        | uuid        | PK   |                   |
| `organization_id`           | uuid        | ✓    | null = global bağ |
| `role_id`                   | uuid        |      | → `role`          |
| `permission_id`             | uuid        |      | → `permission`    |
| `created_at` / `updated_at` | timestamptz |      |                   |

---

## Unique / indeksler

- Unique: `(organization_id, role_id, permission_id)`
- Index: org, role, permission, `(org, role)`, `(org, permission)`

---

## Repo yüzeyi (`role_permission.repo.ts`)

| Fonksiyon                    | Davranış                                   | Parametreler                                | Hata / not                                                                                                     |
| ---------------------------- | ------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `listByRole`                 | Role'e bağlı junction satırları            | `roleId`, `organizationId?`                 | Org verilirse org + global (`organization_id IS NULL`)                                                         |
| `listPermissionSlugsForRole` | Role için slug listesi (sıralı, unique)    | `{ organizationId, roleId }`                | **JOIN** `permission p ON p.id = rp.permission_id`; `p.deleted_at IS NULL`; org/global eşleşme her iki tabloda |
| `insert`                     | Tek junction satırı                        | `RolePermissionInsertInput`                 |                                                                                                                |
| `replaceForRole`             | Org (veya global) setini sil + yeniden yaz | `{ organizationId, roleId, permissionIds }` | `organizationId: null` → global scope delete                                                                   |
| `deleteById`                 | Hard delete                                | `id`                                        |                                                                                                                |

### `listPermissionSlugsForRole` adımları

1. `role_permission rp` + `permission p` inner join.
2. `rp.role_id = roleId`.
3. `rp.organization_id = orgId OR rp.organization_id IS NULL`.
4. `p.organization_id = orgId OR p.organization_id IS NULL`.
5. `p.deleted_at IS NULL`.
6. Slug'ları unique + sort.

---

## Tüketiciler

| Domain                                                      | Dosyalar                 | Kullanım                                                       |
| ----------------------------------------------------------- | ------------------------ | -------------------------------------------------------------- |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md)         | `resolve-permissions.ts` | `listPermissionSlugsForRole` — session permission slug listesi |
| [`apps/web/role/domain`](../../apps/web/role/domain/doc.md) | (ileride)                | `replaceForRole` — rol CRUD izin seti                          |

`person_permission` override'ları henüz `resolve-permissions`'a bağlanmadı — ayrı iş.
