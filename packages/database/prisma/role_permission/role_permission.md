# role_permission

Rol–izin köprüsü.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/role_permission/role-permission/model.js`

Tablo: `role_permission` · Soft delete yok

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `role_id` | UUID | Rol — `role.id` |
| `permission_id` | UUID | İzin — `permission.id` |
| `organization_id` | UUID? | Organizasyon kapsamı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |

## Deferred FKs

`role_id` → role · `permission_id` → permission · `organization_id` → organization
