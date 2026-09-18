# permission

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `permission`  
**Dosyalar:** `permission.prisma`, `permission.repo.ts`  
**Tür:** Entity — atomik yetki tanımı (slug).

**Soft-delete:** `deleted_at` — `softDelete` ve varsayılan sorgular filtreler. Junction sorguları (`role_permission.listPermissionSlugsForRole`) soft-deleted permission'ları JOIN filtresiyle hariç tutar.

---

## Amaç

`slug` makine-okur yetki anahtarıdır (ör. `person.read`). Global (`organization_id` null) veya org'a özel olabilir. Rollere `role_permission`, kişi override'a `person_permission` ile bağlanır.

---

## Alanlar

| Alan                                  | Tip          | Null | Açıklama        |
| ------------------------------------- | ------------ | ---- | --------------- |
| `id`                                  | uuid         | PK   |                 |
| `organization_id`                     | uuid         | ✓    | null = global   |
| `slug`                                | varchar(255) |      | Org+slug unique |
| `name`                                | varchar(255) |      | Görünen ad      |
| `description`                         | varchar(500) | ✓    |                 |
| `is_locked`                           | bool         |      | Sistem kilidi   |
| `*_by_id` / timestamps / `deleted_at` |              |      | Soft-delete var |

---

## Unique / indeksler

- Unique: `(organization_id, slug)`
- Index: `organization_id`, `is_locked`

---

## Repo yüzeyi (`permission.repo.ts`)

| Fonksiyon          | Davranış             | Parametreler                      | Hata / not                           |
| ------------------ | -------------------- | --------------------------------- | ------------------------------------ |
| `findById`         | Aktif permission     | `id`                              |                                      |
| `findGlobalBySlug` | Global slug → id     | `slug`                            | `organization_id IS NULL`            |
| `search`           | Global + session org | `orgId`, `PermissionSearchParams` | `q` → name/slug ILIKE                |
| `insert`           | Org permission       | `orgId`, `PermissionInsertInput`  | `organization_id = orgId`            |
| `update`           | Kısmi güncelleme     | `id`, `PermissionUpdateInput`     | Domain kilit guard                   |
| `softDelete`       | `deleted_at` set     | `id`                              | Kilitli izinler domain'de reddedilir |

---

## Tüketiciler

| Domain                                                                  | Dosyalar                                                     | Kullanım                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| [`apps/web/permission/domain`](../../apps/web/permission/domain/doc.md) | `create`, `get`, `search`, `update`, `soft-delete`, `guards` | CRUD                                                              |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md)                     | `resolve-permissions.ts`                                     | Slug listesi `role_permission` JOIN ile (bu modül import edilmez) |

Slug çözümleme auth tarafında doğrudan `permission.repo` çağırmaz — `role_permission.listPermissionSlugsForRole` SQL join kullanır.
