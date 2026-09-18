# country

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `country`  
**Dosyalar:** `country.prisma`, `country.repo.ts`  
**Tür:** Lookup — ülke referans listesi.

**Soft-delete:** `deleted_at` — varsayılan sorgular filtreler; `softDelete` `deleted_by_id` de set edebilir.

---

## Amaç

`user.country_id` / `nationality_id`, `organization.country_id`, `person.country_id` için referans. Admin yüzeyi yazabilir; diğer yüzeyler çoğunlukla okur. FK Prisma'da tanımlı değil — uygulama seviyesinde referans.

---

## Alanlar

| Alan                                  | Tip          | Null   | Açıklama                                 |
| ------------------------------------- | ------------ | ------ | ---------------------------------------- |
| `id`                                  | uuid         | PK     |                                          |
| `name`                                | varchar(255) | unique | İngilizce / resmi liste adı              |
| `native_name`                         | varchar(255) | ✓      | Yerel ad                                 |
| `official_name`                       | varchar(255) | ✓      | Resmi uzun ad                            |
| `iso`                                 | varchar(2)   | unique | ISO-3166 alpha-2 (repo upper-case yazar) |
| `phone_code`                          | varchar(10)  | ✓      | Telefon kodu                             |
| `currency_code`                       | varchar(5)   | ✓      | ISO para birimi                          |
| `currency_symbol`                     | varchar(10)  | ✓      | Sembol                                   |
| `region` / `subregion`                | varchar      | ✓      | Coğrafi grup                             |
| `capital`                             | varchar(100) | ✓      | Başkent                                  |
| `timezones`                           | text[]       |        | IANA timezone listesi                    |
| `*_by_id` / timestamps / `deleted_at` |              |        | Soft-delete var                          |

---

## İndeksler

Unique: `name`, `iso`. Index: `region`, `subregion`.

---

## Repo yüzeyi (`country.repo.ts`)

| Fonksiyon    | Davranış                                                    | Parametreler               | Hata / not               |
| ------------ | ----------------------------------------------------------- | -------------------------- | ------------------------ |
| `findById`   | Aktif ülke                                                  | `id`                       | `deleted_at IS NULL`     |
| `findByIso`  | ISO alpha-2 (upper-case normalize)                          | `iso`                      |                          |
| `search`     | `q` (name/native/official/iso ILIKE), `region`, `subregion` | `CountrySearchParams`      | Default sıra `name ASC`  |
| `insert`     | Yeni ülke; `iso.toUpperCase()`                              | `CountryInsertInput`       | `timezones` default `[]` |
| `update`     | Kısmi güncelleme                                            | `id`, `CountryUpdateInput` | iso verilirse upper-case |
| `softDelete` | `deleted_at` + opsiyonel `deleted_by_id`                    | `id`, `deletedById?`       |                          |

---

## Tüketiciler

| Yüzey           | Durum       | Kullanım                                                                                           |
| --------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `apps/admin`    | Plan        | Country CRUD — [`apps/admin/index.ts`](../../apps/admin/index.ts) notu                             |
| Entity modüller | FK alanları | `user`, `organization`, `person` şemalarında `country_id` / `nationality_id` — doğrulama domain'de |

Henüz aktif domain import'u yok; liste endpoint eklendiğinde bu repo kullanılacak.

İlgili modüller: [`user`](../user/doc.md), [`organization`](../organization/doc.md), [`person`](../person/doc.md).
