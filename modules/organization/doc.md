# organization

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `organization`  
**Dosyalar:** `organization.prisma`, `enums.prisma`, `organization.repo.ts`  
**Tür:** Entity — kiracı (tenant) kökü.

**Soft-delete:** `deleted_at` — `findById` / `search` / `update` filtreler; `findByIdAny` ve `clearDeletedAt` restore için silinmiş dahil okur.

---

## Amaç

Bir şirket / kurum kaydı. Üyelik `access`, çalışanlar `person`/`employee`, roller org kapsamında veya globaldir.

---

## Alanlar

| Alan                                                                             | Tip                        | Null     | Açıklama                            |
| -------------------------------------------------------------------------------- | -------------------------- | -------- | ----------------------------------- |
| `id`                                                                             | uuid                       | PK       |                                     |
| `country_id`                                                                     | uuid                       | ✓        | Ülke → `country`                    |
| `unique_id`                                                                      | text                       | ✓ unique | Dış sistem / iş kimliği             |
| `company_name`                                                                   | varchar(255)               | ✓        | Unvan                               |
| `first_name` / `last_name`                                                       | varchar                    | ✓        | Sahip / iletişim adı (seed)         |
| `business_type`                                                                  | `OrganizationBusinessType` |          | Zorunlu işletme türü                |
| `legal_form`                                                                     | `OrganizationLegalForm`    | ✓        | DE hukuk formu (gmbh, ug, …)        |
| `established_date`                                                               | date                       | ✓        | Kuruluş                             |
| `email` / `phone_*` / `fax` / `website`                                          | varchar                    | ✓        | İletişim                            |
| `company_no` / `tax_id` / `vat_id` / `bin`                                       | varchar                    | ✓        | Ticari kimlikler                    |
| `trade_license_no` / `commercial_register_no` / `eori_number` / `register_court` | varchar                    | ✓        | Sicil                               |
| `account_holder`                                                                 | varchar                    | ✓        | Hesap sahibi metni                  |
| `industry_category`                                                              | varchar                    | ✓        | Sektör                              |
| `image` / `about`                                                                | text                       | ✓        | Logo / açıklama                     |
| `status`                                                                         | `OrganizationStatus`       |          | `active` \| `inactive` \| `blocked` |
| `expired_date`                                                                   | timestamptz                | ✓        |                                     |
| `owner_id`                                                                       | uuid                       | ✓        | İlk sahip → `user`                  |
| `created_by_id` / `updated_by_id`                                                | uuid                       | ✓        | Audit                               |
| `created_at` / `updated_at` / `deleted_at`                                       | timestamptz                |          | Soft-delete var                     |

---

## Enum'lar

**OrganizationStatus:** `active`, `inactive`, `blocked`

**OrganizationBusinessType:**  
`sole_proprietorship`, `partnership`, `corporation`, `cooperative`, `association`, `civil_law_foundation`, `public_authority`, `public_law_institution`, `public_law_corporation`, `state_municipal_enterprise`

**OrganizationLegalForm:**  
`gmbh`, `ug`, `ag`, `kgaa`, `gmbh_co_kg`, `ug_co_kg`, `ag_co_kg`, `se`

---

## İndeksler

- Unique: `unique_id`
- Index: `status`, `country_id`

---

## Sabitler

| Sabit           | Değer                                  | Açıklama                                                                                       |
| --------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `OWNER_ROLE_ID` | `056aa378-1422-41a3-b9f3-a6c02d365232` | Global owner rol UUID — seed ile aynı; org create sırasında access `role_id` olarak kullanılır |

---

## Repo yüzeyi (`organization.repo.ts`)

| Fonksiyon                 | Davranış                                  | Parametreler                    | Hata / not                       |
| ------------------------- | ----------------------------------------- | ------------------------------- | -------------------------------- |
| `findById`                | Aktif org getirir                         | `id`                            | `deleted_at IS NULL`             |
| `findByIdAny`             | Silinmiş dahil; `deleted_at` kolonu döner | `id`                            | Restore öncesi kontrol           |
| `findActiveByCompanyName` | Aktif org adı çakışması                   | `companyName`                   | Sadece `id`                      |
| `search`                  | `q` ile company_name / ad / e-posta ILIKE | `OrganizationSearchParams`      | Sayfalı                          |
| `insert`                  | Yeni org; default `status: active`        | values + opsiyonel `trx`        | Transaction içinden çağrılabilir |
| `update`                  | Kısmi güncelleme                          | `id`, `OrganizationUpdateInput` | Soft-deleted hariç               |
| `softDelete`              | `deleted_at` set                          | `id`                            |                                  |
| `clearDeletedAt`          | Restore — `deleted_at: null`              | `id`                            | Sadece silinmiş satırda          |

Export: `COLUMNS`, `OrganizationBusinessType`, `OWNER_ROLE_ID`.

---

## Tüketiciler

| Domain                                                                                                                                 | Dosyalar                                                       | Kullanım                                 |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| [`apps/common/organization/domain`](../../apps/common/organization/domain/doc.md)                                                      | `create-with-owner`, `get`, `search`, `soft-delete`, `restore` | CRUD + owner bootstrap (`OWNER_ROLE_ID`) |
| [`apps/web/invite/domain`](../../apps/web/invite/domain/doc.md), [`apps/public/invite/domain`](../../apps/public/invite/domain/doc.md) | `flows.ts`                                                     | Davet mailinde org bilgisi               |
