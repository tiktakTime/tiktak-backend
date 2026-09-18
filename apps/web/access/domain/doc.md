# access — domain

İndeks: [`apps/web/access/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create.ts`, `get.ts`, `search.ts`, `update.ts`, `upsert.ts`, `remove.ts`

Kullanıcı ↔ org üyeliği. Soft-delete yok; silme hard delete.

---

## Zincir

| Endpoint                  | tenant   | policy          | Domain         | Repo                                   |
| ------------------------- | -------- | --------------- | -------------- | -------------------------------------- |
| `GET .../search`          | `member` | —               | `searchAccess` | `access.search`                        |
| `GET .../{id}`            | `member` | —               | `getAccess`    | `access.findById`                      |
| `POST .../`               | `none`   | `access.post`   | `createAccess` | `access.insert`                        |
| `PATCH .../upsert-access` | `none`   | `access.patch`  | `upsertAccess` | `access` · `person` · `session-revoke` |
| `PATCH .../{id}`          | `none`   | `access.patch`  | `updateAccess` | `access.update`                        |
| `DELETE .../{id}`         | `none`   | `access.delete` | `removeAccess` | `access.deleteById` · revoke           |

---

## getAccess `get.ts:5`

`findById` — yoksa `NOT_FOUND / access`.

## searchAccess `search.ts:5`

`repo.search(userId, params)` — delege (user_id filtre zorunlu repo’da).

## createAccess `create.ts:5`

Doğrudan `insert`: org, user, person_id?, status default `"active"`, description?, expired_date Date.

⚠ Person/role senkronu **yok** — upsert kullanmadan raw create person’ı güncellemez.

## updateAccess `update.ts:7`

`repo.update` — yoksa `NOT_FOUND / access`. Session revoke yok.

---

## upsertAccess `upsert.ts:9`

Üyelik oluştur veya güncelle. Person varsa role/expired person’dan gelir.

**Girdi (`AccessCreate`)**

| Alan                         | Zorunlu | Varsayılan / not                   |
| ---------------------------- | ------- | ---------------------------------- |
| `organization_id`, `user_id` | ✓       |                                    |
| `person_id`                  |         | person bulunursa onun id’si tercih |
| `status`                     |         | `"active"`                         |
| `description`                |         | `null`                             |
| `expired_date`               |         | yoksa `person.expired_date`        |

**Adımlar**

1. `person = findActiveByUserId(org, user)`.
2. `existing = findByUserOrg(user, org)`.
3. `expiredDate` = girdi Date **veya** `person?.expired_date` **veya** `null`.
4. Existing varsa `updateUpsertFields`; yoksa `insert`.
   - `person_id = person?.id ?? input.person_id ?? null`
   - `role_id = person?.role_id ?? null` — **girdideki role kullanılmaz**
5. Person var **ve** `input.status ∈ {active, inactive, blocked}` ise  
   `syncPersonFromAccess(person.id, status, expired?)`
   - `expired_date` alanı input’ta **yoksa** `undefined` (dokunulmaz)
   - varsa Date veya `null`
6. Sonuç status `"active"` değilse `revokeOrganizationSessions(user, org)`.
7. `row` yoksa `NOT_FOUND / access`.

**Hatalar:** `NOT_FOUND / access`.

**Yan etkiler:** access yaz · person sync · Redis oturum revoke.

**Transaction:** yok — üç ayrı yazma; kısmi başarı mümkün (⚠).

---

## removeAccess `remove.ts:6`

**Adımlar**

1. `findById` — yoksa `NOT_FOUND`.
2. `deleteById` (hard).
3. `user_id` + `organization_id` varsa `revokeOrganizationSessions`.
4. Delete sonucu yoksa yine `NOT_FOUND`.

**Yan etki:** org oturumları düşer.
