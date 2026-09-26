# role

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `role`  
**Dosyalar:** `role.prisma`, `role.repo.ts`  
**Tür:** Entity — yetki grubu (global veya org'a özel).

**Soft-delete:** `deleted_at` — `softDelete` set eder; liste ve get filtreler.  
**Junction:** İzinler `role_permission` tablosunda; `permissions` alanı insert/update input'unda **ignore** edilir.

---

## Amaç

`organization_id = null` → global rol (ör. owner seed, `OWNER_ROLE_ID`). Org rolü slug org içinde unique. `is_locked` true ise domain güncellemeyi reddeder ([`apps/web/role/domain`](../../apps/web/role/domain/doc.md)).

---

## Alanlar

| Alan                                  | Tip          | Null | Açıklama                               |
| ------------------------------------- | ------------ | ---- | -------------------------------------- |
| `id`                                  | uuid         | PK   |                                        |
| `organization_id`                     | uuid         | ✓    | null = global                          |
| `slug`                                | varchar(255) | ✓    | Makine adı (`owner`, `super_admin`, …) |
| `name`                                | varchar(255) |      | Görünen ad                             |
| `description`                         | varchar(500) | ✓    |                                        |
| `is_locked`                           | bool         |      | Kilitli sistem rolü                    |
| `*_by_id` / timestamps / `deleted_at` |              |      | Soft-delete var                        |

---

## Unique / indeksler

- Unique: `(organization_id, slug)`
- Index: `organization_id`, `is_locked`

Liste sorgusu `super_admin` slug'ını hariç tutar.

---

## Repo yüzeyi (`role.repo.ts`)

| Fonksiyon    | Davranış                                          | Parametreler                | Hata / not                              |
| ------------ | ------------------------------------------------- | --------------------------- | --------------------------------------- |
| `findById`   | Aktif rol                                         | `id`                        | `deleted_at IS NULL`                    |
| `search`     | Global + session org rolleri; `super_admin` hariç | `orgId`, `RoleSearchParams` | `q` → name/slug ILIKE                   |
| `insert`     | Org rolü; `organization_id = orgId`               | `orgId`, `RoleInsertInput`  | `permissions` strip edilir              |
| `update`     | Kısmi güncelleme                                  | `id`, `RoleUpdateInput`     | `permissions` strip; domain kilit guard |
| `softDelete` | `deleted_at` set                                  | `id`                        | Kilitli roller domain'de reddedilir     |

---

## Tüketiciler

| Domain                                                                            | Dosyalar                                                     | Kullanım                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| [`apps/web/role/domain`](../../apps/web/role/domain/doc.md)                       | `create`, `get`, `search`, `update`, `soft-delete`, `guards` | CRUD + `is_locked` kontrolü                                     |
| [`apps/common/organization/domain`](../../apps/common/organization/domain/doc.md) | `create-with-owner.ts`                                       | `OWNER_ROLE_ID` sabiti (organization repo'dan) access'e yazılır |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md)                               | `resolve-permissions.ts`                                     | Access `role_id` → `role_permission.listPermissionSlugsForRole` |

İzin seti güncellemesi: `role_permission.replaceForRole` (ileride role create/update domain'ine bağlanacak).
