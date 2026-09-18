# person

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `person`  
**Dosyalar:** `person.prisma`, `enums.prisma`, `person.repo.ts`  
**Tür:** Entity — org içi kişi kaydı (HR / üyelik kimliği).

**Soft-delete:** `deleted_at` — `markDeleted` / `restoreAndUpdate` / `clearDeletedAt` domain soft-delete akışının repo katmanı.  
**Kardeş / SQL:** `syncAccessStatus` ve `deleteAccessByPerson` `access` tablosuna SQL ile yazar. TypeScript kardeş import da serbest.

---

## Amaç

Bir `organization` altındaki kişi. `user_id` ile platform hesabına, `employee_id` ile çalışan kaydına, `role_id` ile varsayılan role bağlanabilir. Aynı e-posta org içinde unique.

---

## Alanlar

| Alan                                                           | Tip            | Null | Açıklama                                |
| -------------------------------------------------------------- | -------------- | ---- | --------------------------------------- |
| `id`                                                           | uuid           | PK   |                                         |
| `organization_id`                                              | uuid           |      | Kiracı                                  |
| `user_id`                                                      | uuid           | ✓    | Bağlı hesap → `user`                    |
| `role_id`                                                      | uuid           | ✓    | Varsayılan rol → `role`                 |
| `employee_id`                                                  | uuid           | ✓    | Bağlı çalışan → `employee`              |
| `country_id` / `nationality_id`                                | uuid           | ✓    | → `country`                             |
| `first_name` / `last_name` / `display_name`                    | varchar        |      | `display_name` opsiyonel                |
| `email`                                                        | varchar(255)   | ✓    | Org-içi unique                          |
| `gender`                                                       | `PersonGender` |      | `female` \| `male` \| `other` \| `none` |
| `birth_*` / `picture` / `phone_*`                              | …              | ✓    | Profil                                  |
| `driver_license_*` / `insurance_*` / `tax_*` / sağlık alanları | varchar        | ✓    | HR alanları                             |
| `status`                                                       | `PersonStatus` |      | `active` \| `inactive` \| `blocked`     |
| `expired_date`                                                 | timestamptz    | ✓    |                                         |
| `*_by_id` / timestamps / `deleted_at`                          |                |      | Soft-delete var                         |

---

## Enum'lar

**PersonStatus:** `active`, `inactive`, `blocked`  
**PersonGender:** `female`, `male`, `other`, `none` — user'dan farklı olarak `other` var.

---

## Unique / indeksler

- Unique (org kapsamında): `(organization_id, employee_id)`, `(organization_id, user_id)`, `(organization_id, email)`
- Index: org, org+email, org+name, org+role

---

## Repo yüzeyi (`person.repo.ts`)

| Fonksiyon              | Davranış                                                   | Parametreler                                 | Hata / not                                                      |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| `findById`             | Org kapsamında aktif person                                | `orgId`, `id`                                |                                                                 |
| `findByIdAny`          | Silinmiş dahil; `id`, `deleted_at`                         | `orgId`, `id`                                | Restore / çakışma kontrolü                                      |
| `findByUserIdAny`      | Org + user_id (silinmiş dahil)                             | `orgId`, `userId`                            |                                                                 |
| `findByEmailAny`       | Org + email (silinmiş dahil)                               | `orgId`, `email`                             |                                                                 |
| `findActiveByUserId`   | Aktif person özet (role, status, employee_id)              | `orgId`, `userId`                            | Auth switch-org                                                 |
| `search`               | `q`, `role_id`, `status` filtreleri                        | `orgId`, `PersonSearchParams`                | Sayfalı                                                         |
| `insert`               | Yeni person; default `status: inactive`, `gender: none`    | `PersonInsertValues`, opsiyonel `trx`        |                                                                 |
| `restoreAndUpdate`     | Soft-deleted satırı geri getir + alan patch                | `id`, patch, opsiyonel `trx`                 | `deleted_at: null`                                              |
| `update`               | Org kapsamında kısmi güncelleme                            | `orgId`, `id`, `PersonUpdateInput`           |                                                                 |
| `markDeleted`          | Soft-delete; `user_id`, `employee_id` döner (cascade için) | `orgId`, `id`, opsiyonel `trx`               | Domain: [`soft-delete.ts`](../../apps/web/person/domain/doc.md) |
| `clearEmployeeId`      | `employee_id` null                                         | `orgId`, `id`, opsiyonel `trx`               | Employee soft-delete adımı                                      |
| `setEmployeeId`        | `employee_id` bağla                                        | `orgId`, `id`, `employeeId`, opsiyonel `trx` | Creator akışı                                                   |
| `clearDeletedAt`       | Restore (koşulsuz `deleted_at: null`)                      | `orgId`, `id`                                |                                                                 |
| `syncAccessStatus`     | Bağlı access satırlarının `status` güncelle                | `orgId`, `personId`, `status`                | Sadece `active`/`inactive`/`blocked` access'ler; SQL → `access` |
| `deleteAccessByPerson` | Person'a bağlı access satırlarını hard delete              | `orgId`, `personId`, opsiyonel `trx`         | Person soft-delete cascade                                      |

---

## Tüketiciler

| Domain                                                                                                                                 | Dosyalar                                                      | Kullanım                                    |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| [`apps/web/person/domain`](../../apps/web/person/domain/doc.md)                                                                        | `create`, `get`, `search`, `update`, `soft-delete`, `restore` | CRUD + soft-delete orkestrasyonu            |
| [`apps/web/employee/domain`](../../apps/web/employee/domain/doc.md)                                                                    | `creator.ts`                                                  | Person resolve/create + employee bağlama    |
| [`apps/web/access/domain`](../../apps/web/access/domain/doc.md)                                                                        | `upsert.ts`                                                   | `findActiveByUserId`, person-access senkron |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md)                                                                                    | `switch-organization.ts`                                      | `findActiveByUserId`                        |
| [`apps/web/invite/domain`](../../apps/web/invite/domain/doc.md), [`apps/public/invite/domain`](../../apps/public/invite/domain/doc.md) | `flows.ts`                                                    | Davet kabulünde person güncelleme           |
