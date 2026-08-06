# bank_account

Polymorphic banka hesabı (`reference_id`).  
Kaynak: `tiktak-service-humans/project/src/v2/module/common/bank-account/model.js`

Tablo: `bank_account` · Soft delete: `deleted_at`

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID? | Organizasyon kapsamı |
| `reference_id` | UUID | Hedef kayıt (person/company/…) |
| `owner_name` | varchar(255) | Hesap sahibi adı |
| `is_owner` | bool | true = entity sahibi; false = başka kişi |
| `is_default` | bool | Varsayılan hesap (reference başına en fazla bir) |
| `bank_name` | varchar(255) | Banka adı |
| `bank_country` | varchar(2)? | Banka ülkesi ISO |
| `currency` | varchar(3)? | Para birimi (TRY, EUR…) |
| `iban` | varchar(34)? | IBAN |
| `swift_code` | varchar(11)? | SWIFT / BIC |
| `account_number` | varchar(50)? | Hesap no |
| `routing_number` | varchar(20)? | Routing no (ABD) |
| `description` | text? | Açıklama |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Notes

Partial unique (migration): `reference_id` WHERE `is_default` AND `deleted_at IS NULL`.

## Deferred FKs

`organization_id` → organization · `reference_id` polymorphic
