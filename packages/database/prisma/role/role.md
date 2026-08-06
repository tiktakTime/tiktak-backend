# role

Rol.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/role_permission/role/model.js`

Tablo: `role` · Soft delete: `deleted_at`  
`organization_id` null → platform / sistem rolü (`user.system_role_id`).

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID? | null = sistem rolü |
| `slug` | varchar(255)? | Org içinde unique |
| `name` | varchar(255) | Rol adı |
| `description` | varchar(500)? | Açıklama |
| `is_locked` | bool | Kilitli |
| `created_by_id` | UUID? | Oluşturan kullanıcı |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı |
| `deleted_by_id` | UUID? | Silen kullanıcı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |
| `deleted_at` | timestamptz? | Soft delete |

## Deferred FKs

`organization_id` → organization · audit → user  
`user.system_role_id` bu tabloya (org null) bağlanır.
