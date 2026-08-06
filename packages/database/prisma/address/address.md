# address

Polymorphic adres (`reference_id` → person / company / user vb., DB FK yok).  
Kaynak: `tiktak-service-humans/project/src/v2/module/common/address/model.js`

Tablo: `address` · Soft delete: `deleted_at`

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID? | Organizasyon kapsamı (listeleme) |
| `reference_id` | UUID | Hedef kayıt (person/company/…) |
| `name` | varchar(255) | Adres adı (Ev, İş…) |
| `st_num` | varchar(50)? | Sokak / kapı no |
| `st_name` | varchar(255) | Sokak adı |
| `neighbh` | varchar(255)? | Mahalle |
| `city` | varchar(255) | Şehir |
| `state` | varchar(255)? | Eyalet / bölge |
| `zip` | varchar(20)? | Posta kodu |
| `cnt_name` | varchar(255)? | Ülke adı (serbest metin) |
| `is_default` | bool | Varsayılan adres (reference başına en fazla bir) |
| `address_description` | text? | Açıklama |
| `place_id` | varchar(255)? | Google Places place ID |
| `lat` | decimal(9,6)? | Enlem |
| `lng` | decimal(9,6)? | Boylam |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Notes

Partial unique (migration): `reference_id` WHERE `is_default` AND `deleted_at IS NULL`.  
Prisma şemasında partial index yok.

## Deferred FKs

`organization_id` → organization · `reference_id` polymorphic
