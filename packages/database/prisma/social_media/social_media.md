# social_media

Polymorphic sosyal medya hesabı.  
Kaynak: `tiktak-service-humans/project/src/v2/module/common/social-media/model.js`

Tablo: `social_media` · Soft delete: `deleted_at`

## Enums (`enums.prisma`)

| Enum | Değerler | Kolon |
|------|----------|--------|
| `SocialMediaPlatform` | `instagram`, `facebook`, `linkedin`, `tiktok`, `twitter`, `youtube`, `website` | `platform` |

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID? | Organizasyon kapsamı |
| `reference_id` | UUID | Hedef kayıt (person/company/…) |
| `platform` | `SocialMediaPlatform` | Platform |
| `url` | varchar(500)? | Profil / sayfa URL |
| `username` | varchar(255)? | Kullanıcı adı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Deferred FKs

`organization_id` → organization · `reference_id` polymorphic
