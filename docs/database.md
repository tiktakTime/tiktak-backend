# Database

Prisma (şema + migrate) + Kysely (runtime query). Minimum setup.

Genel mimari: [architecture.md](./architecture.md) · Kararlar: [decisions.md](./decisions.md)

---

## Sorumluluk ayrımı

| Ne                                         | Nerede                                              |
| ------------------------------------------ | --------------------------------------------------- |
| Entity `.prisma`, `enums.prisma`, `doc.md` | `modules/<entity>/`                                 |
| Modül indeksi                              | [`modules/doc.md`](../modules/doc.md)               |
| Generator tanımı                           | `modules/schema.prisma`                             |
| Migration SQL                              | `core/database/prisma/migrations/`                  |
| Kysely pool                                | `core/database/db.ts`                               |
| Generate çıktısı                           | `core/database/generated/kysely/` (gitignore)       |
| Modül sabitleri                            | `modules/<entity>/*.ts` (ör. `invite/constants.ts`) |

---

## Ne var / ne yok

| Parça                             | Durum                              |
| --------------------------------- | ---------------------------------- |
| `prisma-kysely` generate          | ✅                                 |
| Prisma migrate / deploy           | ✅                                 |
| Prisma Client runtime             | ❌                                 |
| Zod generate (`zod-prisma-types`) | ❌ (şimdilik)                      |
| Elle `kysely/` kopyası            | ❌ — tek kaynak `generated/kysely` |

---

## Klasör

```
modules/
  schema.prisma
  user/
  country/
  organization/
  role/ | permission/ | role_permission/
  person/ | person_permission/
  employee/
  access/

core/database/
  prisma/migrations/
  db.ts
  generated/kysely/
```

---

## Akış

```
modules/*.prisma  →  prisma migrate  →  SQL (migrations/)
                   →  prisma generate  →  generated/kysely/
                                              ↓
                                         db.ts (Kysely<DB>)
```

---

## Komutlar

```bash
pnpm db:generate        # Kysely tipleri
pnpm db:migrate         # local migrate dev (.env.local)
pnpm db:deploy:local    # local migrate deploy
pnpm db:deploy          # prod migrate deploy
pnpm db:status
pnpm db:studio
```

---

## Yeni model ekleme

1. `modules/<entity>/` — `.prisma` + isteğe bağlı `enums.prisma` + `doc.md`
2. `modules/<entity>/<entity>.repo.ts`
3. Migration: `pnpm db:migrate` (veya SQL + `db:deploy`)
4. `pnpm db:generate`
5. [`modules/doc.md`](../modules/doc.md) listesine satır ekle

---

## Mevcut modeller

Tam liste, alan açıklamaları ve repo yüzeyi → **[`modules/doc.md`](../modules/doc.md)**.

| Modül                                   | Tablo               | Not                                        |
| --------------------------------------- | ------------------- | ------------------------------------------ |
| `user`                                  | `user`              | Platform hesabı                            |
| `organization`                          | `organization`      | Kiracı                                     |
| `person`                                | `person`            | Org kişi                                   |
| `employee`                              | `employee`          | Org çalışan (`experience_id` henüz FK’siz) |
| `access`                                | `access`            | Üyelik köprüsü                             |
| `role` / `permission`                   | …                   | Yetki                                      |
| `role_permission` / `person_permission` | …                   | Junction                                   |
| `invite`                                | `invite`            | Davet                                      |
| `verification_code`                     | `verification_code` | Token / OTP                                |
| `country`                               | `country`           | Lookup                                     |

**Bilinçli ertelenen:** `experience` / `company`, `address`, `bank_account`, `social_media`, `file`.

---

## Kurallar

1. **Şema kaynağı** `modules/` — `core/database` domain modeli içermez.
2. **Kysely tipleri** generate edilir; elle düzenlenmez.
3. **Prod’da** yalnızca `migrate deploy`.
4. **Kolon adları** snake_case.
5. Her modülde **`doc.md`** zorunlu; indeks [`modules/doc.md`](../modules/doc.md).
