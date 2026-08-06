# permission

İzin tanımları.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/role_permission/permission/model.js`

Tablo: `permission` · Soft delete: `deleted_at`

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID? | null = global sistem izni |
| `slug` | varchar(255) | Org içinde unique |
| `name` | varchar(255) | Görünen ad |
| `description` | varchar(500)? | Açıklama |
| `is_locked` | bool | Kilitli (silinemez / değiştirilemez) |
| `created_by_id` | UUID? | Oluşturan kullanıcı |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı |
| `deleted_by_id` | UUID? | Silen kullanıcı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Deferred FKs

`organization_id` → organization · audit → user
