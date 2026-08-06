# user

Sistem kullanıcısı — authentication (email, password, login).  
Kaynak: `tiktak-service-humans/project/src/v2/module/user/model.js`

Tablo: `user` · Soft delete: `deleted_at`

## Enums (`enums.prisma`)

| Enum | Değerler | Kolon |
|------|----------|--------|
| `UserStatus` | `active`, `inactive`, `blocked` | `status` (default: `active`) |
| `UserGender` | `female`, `male`, `none` | `gender` (default: `none`) |

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik (`gen_random_uuid`) |
| `country_id` | UUID? | Ülke — `country.id` (FK sonra) |
| `nationality_id` | UUID? | Uyruk — `country.id` (FK sonra) |
| `system_role_id` | UUID? | Platform rolü — `role.id` where org null (FK sonra) |
| `first_name` | varchar(255) | Ad |
| `last_name` | varchar(255) | Soyad |
| `email` | varchar(255) unique | Auth e-posta (lowercase) |
| `password` | varchar(255)? | Hash’li şifre |
| `gender` | `UserGender` | Cinsiyet |
| `birth_location` | varchar(255)? | Doğum yeri |
| `birthdate` | date? | Doğum tarihi (DATEONLY) |
| `image` | text? | Profil resmi URL |
| `phone_landline` | varchar(15)? unique | Sabit telefon |
| `phone_mobile` | varchar(50)? unique | Cep telefonu |
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
| `status` | `UserStatus` | Hesap durumu |
| `expired_date` | timestamptz? | Son kullanma |
| `notification_key` | text? | Mobil push key |
| `notification_key_web` | text? | Web push key |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |
| `last_login_at` | timestamptz? | Son giriş |
| `last_password_change_at` | timestamptz? | Son şifre değişimi |
| `is_email_verified` | bool | E-posta doğrulandı |
| `is_phone_verified` | bool | Telefon doğrulandı |
| `is_two_factor_enabled` | bool | 2FA |
| `recovery_email` | varchar(255)? unique | Kurtarma e-posta |
| `is_recovery_email_verified` | bool | Kurtarma e-posta doğrulandı |

## Deferred FKs

`country_id`, `nationality_id`, `system_role_id` → `role` (org null) — hedef migrate edilince `@relation` eklenir.
