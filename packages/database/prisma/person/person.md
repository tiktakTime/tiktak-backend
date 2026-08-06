# person

Organizasyon üyesi / kişi.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/person/model.js`

Tablo: `person` · Soft delete: `deleted_at`

## Enums (paylaşılan)

| Enum | Kaynak | Kolon |
|------|--------|--------|
| `UserGender` | `user/enums.prisma` | `gender` (default: `none`) |
| `OrganizationStatus` | `organization/enums.prisma` | `status` (default: `inactive`) |

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID | Bağlı organizasyon |
| `user_id` | UUID? | Sistem kullanıcısı; org ile unique |
| `role_id` | UUID? | Rol — `role.id` |
| `employee_id` | UUID? | Çalışan — `employee` henüz yok; org ile unique |
| `country_id` | UUID? | Ülke — `country.id` |
| `nationality_id` | UUID? | Uyruk — `country.id` |
| `first_name` | varchar(255) | Ad |
| `last_name` | varchar(255) | Soyad |
| `email` | varchar(255)? | E-posta; org ile unique |
| `gender` | `UserGender` | Cinsiyet |
| `birth_location` | varchar(255)? | Doğum yeri |
| `birthdate` | date? | Doğum tarihi |
| `image` | text? | Profil resmi URL |
| `phone_landline` | varchar(15)? | Sabit telefon |
| `phone_mobile` | varchar(50)? | Cep telefonu |
| `driver_license_no` | varchar(255)? | Ehliyet no |
| `driver_license_type` | varchar(255)? | Ehliyet tipi |
| `driver_license_organization` | varchar(255)? | Ehliyet veren kurum |
| `insurance_company` | varchar(255)? | Sigorta şirketi |
| `insurance_no` | varchar(255)? | Sigorta no |
| `insurance_class` | varchar(255)? | Sigorta sınıfı |
| `tax_no` | varchar(255)? | Vergi no |
| `tax_id` | varchar(255)? | Vergi kimlik no |
| `tax_class` | varchar(255)? | Steuerklasse — `{index}_{slug}` |
| `child_exempt_amount` | varchar(255)? | Çocuk muafiyet tutarı |
| `health_insurance` | varchar(255)? | Sağlık sigortası |
| `social_health_no` | varchar(255)? | Sosyal güvenlik no |
| `status` | `OrganizationStatus` | Aktif / pasif / bloke (default inactive) |
| `expired_date` | timestamptz? | Son kullanma |
| `created_by_id` | UUID? | Oluşturan kullanıcı |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı |
| `deleted_by_id` | UUID? | Silen kullanıcı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Deferred FKs

`organization_id`, `user_id`, `role_id` → role, `employee_id`, `country_id` / `nationality_id`, audit → user
