# organization (common)

İndeks: [`apps/doc.md`](../../doc.md) · yüzey: [`common/doc.md`](../doc.md)

**Dosyalar:** `organization.schema.ts`, `organization.routes.ts`, `domain/`  
**Base path:** `/organization`  
**Mount:** `commonRouter` → `authMiddleware`

---

## Amaç

Organizasyon (kiracı) arama, okuma, oluşturma, restore ve soft-delete. Create akışı owner person + access kurar.

---

## Endpoint'ler

| Method | Path                         | tenant     | policy                | HTTP | code                   |
| ------ | ---------------------------- | ---------- | --------------------- | ---- | ---------------------- |
| GET    | `/organization/search`       | `member`   | `organization.get`    | 200  | (Page)                 |
| GET    | `/organization/{id}`         | `orgParam` | `organization.get`    | 200  | `organization.get`     |
| POST   | `/organization`              | `member`   | —                     | 200  | `organization.create`  |
| PATCH  | `/organization/{id}/restore` | `orgParam` | `organization.patch`  | 200  | `organization.restore` |
| DELETE | `/organization/{id}`         | `orgParam` | `organization.delete` | 200  | `organization.delete`  |

---

## Schema özeti

| Alan / enum                | Değer                                                                        |
| -------------------------- | ---------------------------------------------------------------------------- |
| `OrganizationStatus`       | `active`, `inactive`, `blocked`                                              |
| `OrganizationBusinessType` | `sole_proprietorship`, `partnership`, `corporation`, …                       |
| `OrganizationCreate`       | **`company_name`**, **`business_type`**, opsiyonel `first_name`, `last_name` |
| `OrganizationSchema`       | Şirket kimlik, iletişim, vergi, `owner_id`, `status`, …                      |
| `OrganizationSearchQuery`  | `PaginationQuery`                                                            |

**Create domain:** `createOrganizationWithOwner` — org + owner `person` + `access` (`OWNER_ROLE_ID`).

---

## Domain

[`domain/doc.md`](./domain/doc.md) — create-with-owner, search, restore, soft-delete.

---

## Modüller

`organization`, `access`, `person` (owner rolü)
