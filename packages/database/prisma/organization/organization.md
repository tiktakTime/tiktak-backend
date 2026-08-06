# organization

Tenant / organizasyon kaydı. Soft delete yok.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/model.js`

Tablo: `organization`

## Enums (`enums.prisma`)

| Enum | Değerler | Kolon |
|------|----------|--------|
| `OrganizationStatus` | `active`, `inactive`, `blocked` | `status` (default: `active`) |
| `OrganizationBusinessType` | `sole_proprietorship`, `corporation` | `business_type` |
| `OrganizationLegalForm` | `gmbh`, `ug`, `ag`, `kgaa`, `gmbh_co_kg`, `ug_co_kg`, `ag_co_kg`, `se` | `legal_form` |

Bu enum’lar `company` / `person.status` tarafından da kullanılır.

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `country_id` | UUID? | Ülke — `country.id` (FK sonra) |
| `unique_id` | varchar(255)? unique | Sistem benzersiz organizasyon kodu |
| `company_name` | varchar(255)? unique | Resmi şirket adı |
| `first_name` | varchar(255)? | Tek kişilik işletme sahibi adı |
| `last_name` | varchar(255)? | Tek kişilik işletme sahibi soyadı |
| `business_type` | `OrganizationBusinessType` | İşletme türü (zorunlu) |
| `legal_form` | `OrganizationLegalForm`? | Hukuki şekil |
| `established_date` | date? | Kuruluş tarihi |
| `email` | varchar(255)? | İletişim e-posta |
| `phone_landline` | varchar(15)? | Sabit telefon |
| `phone_mobile` | varchar(50)? | Cep telefonu |
| `fax` | varchar(50)? | Faks |
| `website` | varchar(255)? | Web sitesi URL |
| `company_no` | varchar(255)? | Şirket numarası |
| `tax_id` | varchar(255)? | Vergi kimlik no |
| `vat_id` | varchar(255)? | KDV / VAT no |
| `bin` | varchar(255)? | Business Identification Number |
| `trade_license_no` | varchar(255)? | Ticaret lisans no |
| `commercial_register_no` | varchar(255)? | Ticaret sicil no |
| `eori_number` | varchar(255)? | EORI no |
| `register_court` | varchar(255)? | Kayıt mahkemesi |
| `account_holder` | varchar(255)? | Hesap sahibi bilgisi |
| `industry_category` | varchar(255)? | Sektör kategorisi |
| `image` | text? | Logo / resim URL |
| `about` | text? | Hakkında |
| `status` | `OrganizationStatus` | Aktif / pasif / bloke |
| `expired_date` | timestamptz? | Son kullanma; sonrası pasif |
| `owner_id` | UUID? | Sahip kullanıcı — `user.id` (FK sonra) |
| `created_by_id` | UUID? | Oluşturan kullanıcı |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |

## Deferred FKs

`country_id` → country · `owner_id` / audit → user
