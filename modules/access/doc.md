# access

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `access`  
**Dosyalar:** `access.prisma`, `enums.prisma`, `access.repo.ts`  
**Tür:** Entity (köprü) — kullanıcının org üyeliği.

**Soft-delete:** Yok — kaldırma `deleteById` ile hard delete. Session revoke domain katmanında (`platform/auth`).

**Kardeş / SQL:** `syncPersonFromAccess` `person` tablosuna SQL ile yazar (TypeScript `modules/person` import etmeden). İleride repo çağrısı da serbest.

---

## Amaç

`user` ↔ `organization` bağını tutar. İsteğe bağlı `person_id` ve `role_id`. Üyelik durumu `status` enum ile yönetilir; fiziksel silme hard delete.

---

## Alanlar

| Alan                              | Tip            | Null | Açıklama                    |
| --------------------------------- | -------------- | ---- | --------------------------- |
| `id`                              | uuid           | PK   |                             |
| `organization_id`                 | uuid           |      | Kiracı                      |
| `user_id`                         | uuid           | ✓    | Üye hesap                   |
| `person_id`                       | uuid           | ✓    | Org kişi kaydı              |
| `role_id`                         | uuid           | ✓    | Üyelik rolü (access anında) |
| `status`                          | `AccessStatus` |      | Üyelik durumu               |
| `expired_date`                    | timestamptz    | ✓    |                             |
| `description`                     | text           | ✓    | Not                         |
| `created_by_id` / `updated_by_id` | uuid           | ✓    |                             |
| `created_at` / `updated_at`       | timestamptz    |      | Soft-delete **yok**         |

---

## Enum — AccessStatus

| Değer      | Anlam        |
| ---------- | ------------ |
| `pending`  | Beklemede    |
| `active`   | Aktif üyelik |
| `inactive` | Pasif        |
| `blocked`  | Engelli      |
| `canceled` | İptal        |

`findBlocking` için "bloklayan" durumlar: `active`, `inactive`, `blocked` (invite/create çakışması). `pending` ve `canceled` bloklamaz.

---

## İndeksler

`organization_id`, `user_id`, `person_id`, `status`, `role_id`

---

## Repo yüzeyi (`access.repo.ts`)

| Fonksiyon              | Davranış                                              | Parametreler                                      | Hata / not                                                   |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `findById`             | Tek access satırı                                     | `id`                                              | Status filtresi yok                                          |
| `findByUserOrg`        | User + org çifti                                      | `userId`, `organizationId`                        | Auth switch-org                                              |
| `search`               | Kullanıcının access listesi                           | `userId`, `AccessSearchParams`                    | **`user_id` zorunlu**; opsiyonel `organization_id`, `status` |
| `insert`               | Yeni üyelik; default `status: active`                 | organization_id, user_id, person_id?, role_id?, … |                                                              |
| `update`               | Kısmi güncelleme                                      | `id`, `AccessUpdateInput`                         |                                                              |
| `updateUpsertFields`   | Upsert sonrası alan seti (null-safe)                  | `id`, fields                                      | `person_id`/`role_id` null'a çekilebilir                     |
| `deleteById`           | Hard delete                                           | `id`                                              | `id` döner                                                   |
| `findBlocking`         | Org+user veya org+person için bloklayan access        | `organizationId`, `personId?`, `userId?`          | Önce userId kontrol; sonra personId; `BLOCKING_STATUSES`     |
| `syncPersonFromAccess` | Person `status` (+ opsiyonel `expired_date`) güncelle | `personId`, `status`, `expired_date?`             | SQL → `person`                                               |

---

## Tüketiciler

| Domain                                                                                                                                 | Dosyalar                                                  | Kullanım                               |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------- |
| [`apps/web/access/domain`](../../apps/web/access/domain/doc.md)                                                                        | `create`, `get`, `search`, `update`, `upsert`, `remove`   | CRUD + upsert (`syncPersonFromAccess`) |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md)                                                                                    | `switch-organization.ts`, `resolve-permissions` (dolaylı) | `findByUserOrg`, person çözümleme      |
| [`apps/web/invite/domain`](../../apps/web/invite/domain/doc.md), [`apps/public/invite/domain`](../../apps/public/invite/domain/doc.md) | `flows.ts`                                                | `findBlocking`, `insert` — davet kabul |
| [`apps/common/organization/domain`](../../apps/common/organization/domain/doc.md)                                                      | `create-with-owner.ts`                                    | Owner access insert                    |

Person soft-delete: [`apps/web/person/domain/soft-delete.ts`](../../apps/web/person/domain/doc.md) → `person.repo.deleteAccessByPerson`.
