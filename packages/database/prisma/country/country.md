# country

Ülke referans tablosu.  
Kaynak: `tiktak-service-humans/project/src/v2/module/helpers/country/model.js`

Tablo: `country` · Soft delete: `deleted_at`

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `name` | varchar(255) unique | Ülke adı (örn. Türkiye) |
| `native_name` | varchar(255)? | Yerel dildeki ad |
| `official_name` | varchar(255)? | Resmi ad (örn. Republic of Turkey) |
| `iso` | varchar(2) unique | ISO 3166-1 alpha-2 (örn. TR) |
| `phone_code` | varchar(10)? | Telefon kodu (örn. +90) |
| `currency_code` | varchar(5)? | Para birimi kodu (örn. TRY) |
| `currency_symbol` | varchar(10)? | Para birimi sembolü (örn. ₺) |
| `region` | varchar(100)? | Bölge (örn. Europe) |
| `subregion` | varchar(100)? | Alt bölge |
| `capital` | varchar(100)? | Başkent |
| `timezones` | text[]? | Saat dilimleri |
| `created_by_id` | UUID? | Oluşturan kullanıcı (FK sonra) |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı (FK sonra) |
| `deleted_by_id` | UUID? | Silen kullanıcı (FK sonra) |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Deferred FKs

Audit kolonları → `user`
