# company

Organizasyon altındaki şirket.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/company/model.js`

Tablo: `company` · Soft delete: `deleted_at`

## Enums (paylaşılan — `organization/enums.prisma`)

| Enum | Kolon |
|------|--------|
| `OrganizationBusinessType` | `business_type` |
| `OrganizationLegalForm` | `legal_form` |
| `OrganizationStatus` | `status` (default: `active`) |

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID | Bağlı organizasyon |
| `country_id` | UUID? | Ülke — `country.id` |
| `reference_id` | UUID? | Eşleşen organization kaydı (match) |
| `company_name` | varchar(255)? | Şirket adı; org ile unique |
| `first_name` | varchar(255)? | Tek kişilik işletme sahibi adı |
| `last_name` | varchar(255)? | Tek kişilik işletme sahibi soyadı |
| `business_type` | `OrganizationBusinessType` | İşletme türü |
| `legal_form` | `OrganizationLegalForm`? | Hukuki şekil |
| `established_date` | date? | Kuruluş tarihi |
| `email` | varchar(255)? | İletişim e-posta |
| `phone_landline` | varchar(15)? | Sabit telefon |
| `phone_mobile` | varchar(50)? | Cep telefonu |
| `fax` | varchar(50)? | Faks |
| `website` | varchar(255)? | Web sitesi |
| `company_no` | varchar(255)? | Şirket numarası |
| `tax_id` | varchar(255)? | Vergi kimlik no |
| `vat_id` | varchar(255)? | KDV / VAT no |
| `bin` | varchar(255)? | BIN |
| `trade_license_no` | varchar(255)? | Ticaret lisans no |
| `commercial_register_no` | varchar(255)? | Ticaret sicil no |
| `eori_number` | varchar(255)? | EORI |
| `register_court` | varchar(255)? | Kayıt mahkemesi |
| `account_holder` | varchar(255)? | Hesap sahibi |
| `industry_category` | varchar(255)? | Sektör |
| `image` | text? | Logo URL |
| `about` | text? | Hakkında |
| `status` | `OrganizationStatus` | Durum |
| `expired_date` | timestamptz? | Son kullanma |
| `created_by_id` | UUID? | Oluşturan kullanıcı |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı |
| `deleted_by_id` | UUID? | Silen kullanıcı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Deferred FKs

`organization_id`, `country_id`, `reference_id` → organization, audit → user
