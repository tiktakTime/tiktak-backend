# person — domain

İndeks: [`apps/web/person/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `get.ts`, `search.ts`, `update.ts`, `soft-delete.ts`, `restore.ts`

---

## Zincir

| Endpoint                         | Guard                          | Domain             | Repo                                  |
| -------------------------------- | ------------------------------ | ------------------ | ------------------------------------- |
| `GET .../search`                 | org + `person.get`             | `searchPersons`    | `person.search`                       |
| `GET .../search-with-user`       | org                            | —                  | ⚠ `not_implemented` (route)           |
| `GET .../dashboard`              | org                            | —                  | ⚠ `not_implemented`                   |
| `GET .../compare-with-user`      | org                            | —                  | ⚠ `not_implemented`                   |
| `POST .../match-with-user`       | org                            | —                  | ⚠ `not_implemented`                   |
| `GET .../{id}/role-permission`   | org                            | —                  | ⚠ `not_implemented`                   |
| `PATCH .../{id}/role-permission` | org                            | —                  | ⚠ `not_implemented`                   |
| `GET .../{id}`                   | org + `person.get`             | `getPerson`        | `person`                              |
| `POST .../`                      | org + `person.post`            | `createPerson`     | `person` · `user`                     |
| `PATCH .../{id}`                 | org + `person.patch`           | `updatePerson`     | `person` · revoke                     |
| `PATCH .../{id}/restore`         | org + `person.patch`           | `restorePerson`    | `person`                              |
| `DELETE .../{id}`                | org + `person.delete` (handler `actorId`) | `softDeletePerson` | `person` · access · employee · revoke |

---

## getPerson `get.ts:5`

`findById(org, id)` — yoksa `NOT_FOUND / person`.

## searchPersons `search.ts:5`

`repo.search` — delege.

---

## createPerson `create.ts:8`

User bağlı veya bağımsız person oluşturur; soft-deleted eşleşmede restore.

**Adımlar**

1. Başlangıç: `first_name`, `last_name`, `email` girdiden; `userId = input.user_id ?? null`.
2. **userId varsa:**
   - User yok → `NOT_FOUND / user`.
   - İsim/email **user’dan zorlanır** (girdi overwrite).
   - Aynı org’da aktif person → `CONFLICT / USER_ALREADY_EXISTS`.
   - Soft-deleted → `restoreAndUpdate` (role, status default `"inactive"`) ve **return**.
3. **email varsa:**
   - Aktif person aynı email → `EMAIL_ALREADY_EXISTS`.
   - Soft-deleted **ve** `userId` yok → restoreAndUpdate ve return.
   - Soft-deleted **ve** `userId` var → restore atlanır; insert yoluna devam (⚠ email çakışması insert’te patlayabilir).
4. `insert` — gender default `"none"`, status default `"inactive"`, expired_date Date veya null; diğer alanlar şemadan.

**Transaction:** yok.

---

## updatePerson `update.ts:10`

**Adımlar**

1. Mevcut yok → `NOT_FOUND / person`.
2. Girdiden `role_id` **çıkarılır** (bu endpoint role değiştirmez).
3. Person’un `user_id`’si varsa ve `email` değişiyorsa → `BAD_REQUEST / PERSON_EMAIL_LOCKED`.
4. `repo.update`.
5. `status ∈ {active, inactive, blocked}` ise `syncAccessStatus(org, id, status)`.
6. Status `active` değil **ve** `user_id` varsa → `revokeOrganizationSessions`.

**Yan etkiler:** access status sync · oturum revoke.  
**Transaction:** yok (⚠).

---

## softDeletePerson `soft-delete.ts:7`

**Adımlar**

1. Yok → `NOT_FOUND`.
2. `existing.user_id === sessionUserId` → `PERSON_CANNOT_DELETE_SELF`.
3. Transaction:
   - `markDeleted`
   - `deleteAccessByPerson` (hard)
   - `employee_id` varsa employee soft-delete + `employee_no=null`, sonra `clearEmployeeId`
4. Dışarıda: `user_id` varsa org session revoke.
5. Dönüş `{ id }`.

**Yan etkiler:** person soft · access silinir · bağlı employee soft · oturumlar düşer.

---

## restorePerson `restore.ts:5`

1. `findByIdAny` — yok → `DELETED_RECORD_NOT_FOUND`.
2. `deleted_at` yok → `ALREADY_ACTIVE`.
3. `clearDeletedAt`.

⚠ Access / employee geri gelmez — yalnızca person satırı.
