# person_permission

İndeks: [`modules/doc.md`](../doc.md)

**Tablo:** `person_permission`  
**Dosyalar:** `person_permission.prisma`, `enums.prisma`, `person_permission.repo.ts`  
**Tür:** Junction — kişi düzeyinde izin override.

**Soft-delete:** Yok — `replaceForPerson` mevcut satırları hard delete eder, yenilerini yazır.

---

## Amaç

Rol izinlerinin üstüne kişiye özel `grant` / `deny`. Org + person + permission üçlüsü unique. Auth `resolve-permissions` henüz bu tabloyu birleştirmez.

---

## Alanlar

| Alan                              | Tip                      | Null | Açıklama                    |
| --------------------------------- | ------------------------ | ---- | --------------------------- |
| `id`                              | uuid                     | PK   |                             |
| `organization_id`                 | uuid                     |      | Kiracı (zorunlu)            |
| `person_id`                       | uuid                     |      | → `person`                  |
| `permission_id`                   | uuid                     |      | → `permission`              |
| `effect`                          | `PersonPermissionEffect` |      | `grant` (default) \| `deny` |
| `created_by_id` / `updated_by_id` | uuid                     | ✓    |                             |
| `created_at` / `updated_at`       | timestamptz              |      |                             |

---

## Enum — PersonPermissionEffect

| Değer   | Anlam                         |
| ------- | ----------------------------- |
| `grant` | Role ek olarak izin ver       |
| `deny`  | Roldeki izni kişi için reddet |

---

## Unique / indeksler

- Unique: `(organization_id, person_id, permission_id)`
- Index: `person_id`, `permission_id`

---

## Repo yüzeyi (`person_permission.repo.ts`)

| Fonksiyon          | Davranış                               | Parametreler                                                | Hata / not                |
| ------------------ | -------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `listByPerson`     | Person'a ait tüm override satırları    | `organizationId`, `personId`                                | `created_at ASC`          |
| `findOne`          | Tek satır (org + person + permission)  | `{ organizationId, personId, permissionId }`                |                           |
| `insert`           | Tek override; default `effect: grant`  | `PersonPermissionInsertInput`                               |                           |
| `replaceForPerson` | Mevcut satırları sil, seti yeniden yaz | `{ organizationId, personId, permissions[], actorUserId? }` | Boş array → sadece delete |
| `deleteById`       | Hard delete                            | `id`                                                        |                           |

---

## Tüketiciler

| Domain                                                          | Dosyalar                 | Kullanım                                                                     |
| --------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| [`apps/web/person/domain`](../../apps/web/person/domain/doc.md) | (ileride)                | Person create/update body'de permission override                             |
| [`apps/auth/domain`](../../apps/auth/domain/doc.md)             | `resolve-permissions.ts` | **Henüz bağlı değil** — role slug'ları + person override birleştirme ayrı iş |

---

## İlişkili modüller

- İzin tanımı: [`permission/doc.md`](../permission/doc.md)
- Rol bazlı izinler: [`role_permission/doc.md`](../role_permission/doc.md)
- Kişi kaydı: [`person/doc.md`](../person/doc.md)
