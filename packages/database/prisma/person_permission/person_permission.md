# person_permission

Kişiye özel izin override.  
Kaynak: `tiktak-service-humans/project/src/v2/module/organization/role_permission/person-permission/model.js`

Tablo: `person_permission` · Soft delete yok  
Efektif yetki ≈ role izinleri ∪ grant − deny

## Enums (`enums.prisma`)

| Enum | Değerler | Kolon |
|------|----------|--------|
| `PersonPermissionEffect` | `grant`, `deny` | `effect` (default: `grant`) |

- `grant`: role dışı ek yetki  
- `deny`: role’de var ama bu kişide kapalı

## Columns

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID PK | Benzersiz kimlik |
| `organization_id` | UUID | Organizasyon kapsamı |
| `person_id` | UUID | Kişi — `person.id` |
| `permission_id` | UUID | İzin — `permission.id` |
| `effect` | `PersonPermissionEffect` | grant / deny |
| `created_by_id` | UUID? | Oluşturan kullanıcı |
| `updated_by_id` | UUID? | Güncelleyen kullanıcı |
| `created_at` / `updated_at` | timestamptz | Zaman damgaları |

## Deferred FKs

`organization_id` → organization · `person_id` → person · `permission_id` → permission · audit → user
