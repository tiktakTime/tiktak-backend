# employee

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `employee`  
**Dosyalar:** `employee.prisma`, `employee.repo.ts`  
**Tür:** Entity — org içi çalışan kaydı (person'a 1:1 org kapsamında).

**Soft-delete:** `deleted_at` — soft-delete sırasında `employee_no` null'lanır (`clearEmployeeNo`). `clearPersonEmployeeLink` `person.employee_id` temizler (SQL; `modules/person` import yok).

---

## Amaç

`person` ile org içinde unique bağ. `employee_no` org içinde dolu numaralar arasında gap-fill ile üretilir. `experience_id` ileride deneyim geçmişine bağlanacak (şimdilik nullable).

---

## Alanlar

| Alan                                  | Tip         | Null | Açıklama                            |
| ------------------------------------- | ----------- | ---- | ----------------------------------- |
| `id`                                  | uuid        | PK   |                                     |
| `organization_id`                     | uuid        |      | Kiracı                              |
| `person_id`                           | uuid        |      | → `person`                          |
| `experience_id`                       | uuid        | ✓    | Deneyim kaydı (henüz yok)           |
| `exit_date`                           | timestamptz | ✓    | İşten çıkış                         |
| `employee_no`                         | int         | ✓    | Sicil no; soft-delete'te null'lanır |
| `*_by_id` / timestamps / `deleted_at` |             |      | Soft-delete var                     |

---

## Unique / indeksler

- Unique: `(organization_id, person_id)`
- Index: org, person, experience, deleted_at, `(organization_id, exit_date)`

---

## Repo yüzeyi (`employee.repo.ts`)

| Fonksiyon                 | Davranış                                      | Parametreler                                | Hata / not                                                    |
| ------------------------- | --------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| `findById`                | Org kapsamında aktif employee                 | `orgId`, `id`                               |                                                               |
| `findActiveByPersonId`    | Person'a bağlı aktif kayıt                    | `orgId`, `personId`                         | Creator duplicate kontrolü                                    |
| `findByPersonIdAny`       | Silinmiş dahil                                | `orgId`, `personId`                         | Restore senaryosu                                             |
| `search`                  | Org employee listesi                          | `orgId`, `EmployeeSearchParams`             | `q`, `role_id`, `person_status` vb. henüz void (ileride join) |
| `insert`                  | Yeni employee                                 | values, opsiyonel `trx`                     |                                                               |
| `restoreAndUpdate`        | Soft-deleted geri getir + `employee_no` patch | `orgId`, `id`, patch, opsiyonel `trx`       |                                                               |
| `update`                  | `experience_id`, `exit_date`, `employee_no`   | `orgId`, `id`, `EmployeeUpdateInput`        |                                                               |
| `clearEmployeeNo`         | Sicil no null (soft-delete adımı)             | `id`, opsiyonel `trx`                       |                                                               |
| `markDeleted`             | `deleted_at` set                              | `orgId`, `id`, opsiyonel `trx`              | Caller transaction orkestrasyonu                              |
| `clearPersonEmployeeLink` | `person.employee_id` null                     | `orgId`, `employeeId`, opsiyonel `trx`      | SQL → `person`                                                |
| `nextEmployeeNo`          | Gap-fill: org'da en küçük boş numara          | `organizationId`                            | Boş org → `1`; raw SQL CTE                                    |
| `isEmployeeNoTaken`       | Sicil no çakışması                            | `organizationId`, `desiredNo`, `excludeId?` | Aktif kayıtlar                                                |
| `findActiveIdPerson`      | Cascade için id + person_id                   | `orgId`, `id`, opsiyonel `trx`              | Soft-delete öncesi                                            |

---

## Tüketiciler

| Domain                                                              | Dosyalar                                                                     | Kullanım                                                  |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`apps/web/employee/domain`](../../apps/web/employee/domain/doc.md) | `create`, `get`, `search`, `update`, `soft-delete`, `creator`, `employee-no` | CRUD + person resolve/create + sicil no                   |
| [`apps/web/person/domain`](../../apps/web/person/domain/doc.md)     | `soft-delete.ts` (dolaylı)                                                   | `clearEmployeeId` / `setEmployeeId` person repo üzerinden |
