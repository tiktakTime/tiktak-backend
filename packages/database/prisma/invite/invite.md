# invite

Organizasyon daveti.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/invite/model.js`

Tablo: `invite` · Soft delete: `deleted_at`

## Enums (`enums.prisma`)

| Enum | Değerler | Kolon |
|------|----------|--------|
| `InviteStatus` | `pending`, `accepted`, `expired`, `canceled` | `status` (default: `pending`) |

`rejected` yok.

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID | Davetin organizasyonu |
| `user_id` | UUID? | Davet edilen user (email eşleşirse / accept’te set) |
| `person_id` | UUID | Bağlı kişi — `person.id` |
| `email` | varchar(255) | Davet anındaki e-posta snapshot |
| `token` | varchar(128) unique | Public accept token |
| `status` | `InviteStatus` | Durum |
| `description` | text? | Opsiyonel açıklama |
| `expires_at` | timestamptz | TTL — sonrası geçersiz |
| `accepted_at` | timestamptz? | Kabul zamanı |
| `canceled_at` | timestamptz? | Admin iptal zamanı |
| `accept_attempts` | int | Başarısız accept denemesi |
| `last_attempt_at` | timestamptz? | Son deneme (pencere hesabı) |
| `locked_until` | timestamptz? | Bu zamana kadar accept kilitli |
| `created_by_id` | UUID? | Oluşturan kullanıcı |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı |
| `deleted_by_id` | UUID? | Silen kullanıcı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Deferred FKs

`organization_id` → organization · `person_id` → person · `user_id` / audit → user
