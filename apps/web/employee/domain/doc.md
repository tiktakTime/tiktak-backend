# employee — domain

İndeks: [`apps/web/employee/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `creator.ts`, `employee-no.ts`, `get.ts`, `search.ts`, `update.ts`, `soft-delete.ts`

---

## Zincir

| Endpoint                       | Guard                | Domain                     | Repo                           |
| ------------------------------ | -------------------- | -------------------------- | ------------------------------ |
| `GET .../search`               | `employee.get` + org | `searchEmployees`          | `employee.search`              |
| `GET .../dashboard`            | org                  | —                          | ⚠ `not_implemented` (route)    |
| `GET .../detail/{id}`          | org                  | —                          | ⚠ `not_implemented`            |
| `GET .../desired-employee-no`  | `employee.get`       | `isEmployeeNoTaken`        | `employee`                     |
| `GET .../get-next-employee-no` | `employee.get`       | `nextEmployeeNo`           | `employee`                     |
| `POST .../creator`             | `employee.post`      | `createEmployeeViaCreator` | `person` · `user` · `employee` |
| `POST .../`                    | `employee.post`      | `createEmployee`           | `employee`                     |
| `GET .../{id}`                 | `employee.get`       | `getEmployee`              | `employee`                     |
| `PATCH .../{id}`               | `employee.patch`     | `updateEmployee`           | `employee`                     |
| `DELETE .../{id}`              | `employee.delete`    | `softDeleteEmployee`       | `employee` (+ person link)     |

---

## employee-no.ts

### nextEmployeeNo `employee-no.ts:5`

`repo.nextEmployeeNo(orgId)` — sonraki boş numara.

### isEmployeeNoTaken `employee-no.ts:9`

`repo.isEmployeeNoTaken(orgId, desiredNo, excludeId?)`.

### allocateEmployeeNo `employee-no.ts:18`

**Adımlar**

1. `desired` null veya `0` → `nextEmployeeNo`.
2. Numara kullanımda (`excludeId` hariç) → `CONFLICT / EMPLOYEE_NO_IN_USE`.
3. Aksi halde `desired` döner.

---

## createEmployee `create.ts:8`

Mevcut person’a employee ekler (creator değil).

**Adımlar**

1. `findActiveByPersonId` dolu → `EMPLOYEE_ALREADY_EXISTS`.
2. `allocateEmployeeNo(orgId, input.employee_no)`.
3. `insert` — `experience_id` null olabilir.

---

## createEmployeeViaCreator `creator.ts:15`

Person çöz/oluştur + employee oluştur/restore. Tek transaction.

**Girdi (`EmployeeCreator`):** `person_id?` | `user_id?` | `email?` + isimler | `employee_no?`

**Adımlar (trx)**

1. `person = resolvePerson(...)`.
2. `employee = assertOrRestoreEmployee(...)`.
3. `personRepo.setEmployeeId(org, person.id, employee.id, trx)`.
4. Dönüş `{ employee, person }`.

⚠ Company/experience alanları v1’de yok sayılır; `experience_id` hep `null`.

---

### resolvePerson `creator.ts:34` (iç)

Öncelik: `person_id` → `user_id` → `email` → yeni kayıt.

1. **person_id:** `findById` — yoksa `NOT_FOUND / person`.
2. **user_id:**
   - Aktif person varsa onu dön.
   - Soft-deleted: user isim/email ile `restoreAndUpdate` status `active`.
   - Yok: user’dan isim/email alıp `insert` status `active`.
   - User yok → `NOT_FOUND / user`.
3. **email:**
   - Aktif person → `findById` ile tam satır.
   - Soft-deleted: `first_name`+`last_name` zorunlu (`CREATOR_REQUIRES_NAME`) → restore.
4. **Yeni:** isimler zorunlu (`CREATOR_REQUIRES_NAME`) → `insert` (email opsiyonel).

---

### assertOrRestoreEmployee `creator.ts:110` (iç)

1. `findByPersonIdAny`.
2. Aktif employee varsa → `CONFLICT / EMPLOYEE_ALREADY_EXISTS`.
3. `allocateEmployeeNo(org, desiredNo)`.
4. Soft-deleted varsa `restoreAndUpdate` (`employee_no`, `experience_id: null`).
5. Yoksa `insert`.

---

## getEmployee `get.ts:5`

`findById` — yoksa `NOT_FOUND / employee`.

## searchEmployees `search.ts:5`

`repo.search(orgId, params)` — delege.

---

## updateEmployee `update.ts:8`

**Adımlar**

1. `employee_no` gönderildiyse `allocateEmployeeNo(org, no, id)` (kendi id exclude).
2. `repo.update` — yoksa `NOT_FOUND / employee`.

---

## softDeleteEmployee `soft-delete.ts:6`

**Adımlar** (transaction)

1. `findActiveIdPerson` — yoksa undefined → dışarıda `NOT_FOUND`.
2. `clearEmployeeNo(id)`.
3. `markDeleted`.
4. `clearPersonEmployeeLink` (person.employee_id temizle).

**Yan etki:** person ↔ employee bağı kopar; numara serbest kalır.
