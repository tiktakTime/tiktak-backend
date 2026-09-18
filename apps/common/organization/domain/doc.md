# organization — domain

İndeks: [`apps/common/organization/doc.md`](../doc.md) · [`apps/doc.md`](../../../doc.md)

Kaynaklar: `create-with-owner.ts`, `get.ts`, `search.ts`, `soft-delete.ts`, `restore.ts`

---

## Zincir

| Endpoint                           | tenant     | policy                | Domain                        | Repo                                        |
| ---------------------------------- | ---------- | --------------------- | ----------------------------- | ------------------------------------------- |
| `GET /organization/search`         | `member`   | `organization.get`    | `searchOrganizations`         | `organization.search`                       |
| `GET /organization/{id}`           | `orgParam` | `organization.get`    | `getOrganization`             | `organization`                              |
| `POST /organization`               | `member`   | —                     | `createOrganizationWithOwner` | `organization` · `user` · person/access SQL |
| `PATCH /organization/{id}/restore` | `orgParam` | `organization.patch`  | `restoreOrganization`         | `organization`                              |
| `DELETE /organization/{id}`        | `orgParam` | `organization.delete` | `softDeleteOrganization`      | `organization`                              |

---

## getOrganization `get.ts:5`

`findById` — yoksa `NOT_FOUND / organization`.

## searchOrganizations `search.ts:5`

`repo.search` — delege.

## softDeleteOrganization `soft-delete.ts:5`

`repo.softDelete` — yoksa `NOT_FOUND / organization`.

⚠ Bağlı person/access/employee cascade yok — yalnızca org soft-delete.

---

## restoreOrganization `restore.ts:5`

1. `findByIdAny` — yok → `DELETED_RECORD_NOT_FOUND`.
2. Zaten aktif → `ALREADY_ACTIVE`.
3. `clearDeletedAt`.

---

## createOrganizationWithOwner `create-with-owner.ts:11`

Org + owner person + access tek transaction.

**Girdi:** `OrganizationCreate` + `ownerUserId` (session).

**Adımlar**

1. Aynı `company_name` aktif org varsa → `CONFLICT / ORGANIZATION_NAME_EXISTS`.
2. Owner user yok → `NOT_FOUND / user`.
3. Transaction:
   - `orgRepo.insert` — `first_name`/`last_name` girdiden veya owner’dan; `owner_id`; `status: "active"`; `business_type`.
   - Person insert: org, owner user, `role_id = OWNER_ROLE_ID`, isim/email owner’dan, status `active`.
   - Access insert: aynı org/user/person, `OWNER_ROLE_ID`, status `active`.
4. Dönüş: **yalnızca org** satırı (person/access id dönmez).

**Sabit:** `OWNER_ROLE_ID` — `modules/organization/organization.repo`.

**Yan etkiler:** 3 tablo. Session otomatik switch **yok** — client `/auth/switch/{id}` çağırır.
