# Database

Prisma (şema + migrate) + Kysely (runtime query). Minimum setup.

Genel mimari: [architecture.md](./architecture.md) · Kararlar: [decisions.md](./decisions.md)

---

## Sorumluluk ayrımı

| Ne                                         | Nerede                                                     |
| ------------------------------------------ | ---------------------------------------------------------- |
| Entity `.prisma`, `enums.prisma`, `doc.md` | `modules/<entity>/`                                        |
| Modül indeksi                              | [`modules/doc.md`](../modules/doc.md)                      |
| Generator tanımı                           | `modules/schema.prisma`                                    |
| Migration SQL                              | `core/database/prisma/migrations/`                         |
| Kysely pool                                | `core/database/db.ts`                                      |
| Generate çıktısı                           | `core/database/generated/kysely/` (gitignore)              |
| Enum değeri + tipi                         | `generated/kysely/enums` → `@/modules/db` (**tek kaynak**) |
| Ürün sabitleri (enum değil)                | `app.config.ts` (ör. invite TTL)                           |

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

## Tek kaynak — enum ve satır tipleri

`prisma-kysely` her enum için **hem değer hem tip** üretir ve `core/database/index.ts`
ikisini de dışarı verir. Elle kopya yazılmaz.

```ts
// generated/kysely/enums.ts
export const InviteStatus = { pending: "pending", accepted: "accepted", … } as const;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];
```

| Yanlış                                                   | Doğru                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| `export const INVITE_STATUS = { PENDING: "pending", … }` | `import { InviteStatus } from "@/modules/db"`                     |
| `export type PersonStatus = "active" \| "inactive" \| …` | `import type { PersonStatus } from "@/modules/db"`                |
| `z.enum(["active", "inactive", "blocked"])`              | `z.enum(PersonStatus)` — [`api-standards.md`](./api-standards.md) |

Referans doğru kullanım: `modules/user/user.repo.ts` → `import type { UserStatus } from "@/modules/db"`.

### Satır tipleri

Repo `COLUMNS` sabitleri `.select(COLUMNS)` üzerinden zaten tip kontrolünden geçer.
Satır tipi de elle yazılmaz, aynı kaynaktan türetilir:

```ts
import type { Selectable } from "kysely";

import type { Invite } from "@/modules/db";

export type InviteRow = Pick<Selectable<Invite>, (typeof COLUMNS)[number]>;
```

`Selectable` gerekli — üretilen tipler `Generated<T>` / `Timestamp` sarmalayıcıları
kullanır; `Selectable` bunları okuma şekline (`string`, `Date`) açar.

Böylece zincir kapanır:

```
prisma → generated DB tipi → COLUMNS → Row → domain → zod şeması
         ✅ otomatik        ✅ tsc    ✅     ✅       tip köprüsü (api-standards)
```

### Enum değişikliği ne yakalanır

| Değişiklik                    | Sonuç                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Değer silindi / adı değişti   | `tsc` kırılır (tek kaynak)                                                          |
| Kolon silindi / tipi değişti  | `tsc` kırılır (`COLUMNS` + `Selectable`)                                            |
| Enum'a **yeni değer eklendi** | Sessiz — karar tablosu `Record<Enum, …>` ile korunur ([`testing.md`](./testing.md)) |

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
3. **Enum değeri ve tipi** yalnızca `@/modules/db`'den okunur — kopya sabit yazılmaz.
4. **Satır tipleri** `Pick<Selectable<T>, COLUMNS>` ile türetilir; elle yazılmaz.
5. **Prod’da** yalnızca `migrate deploy`.
6. **Kolon adları** snake_case.
7. Her modülde **`doc.md`** zorunlu; indeks [`modules/doc.md`](../modules/doc.md).
8. Her modülün `doc.md`'sinde **"Değişmezler"** bölümü — testler oradan yazılır ([`testing.md`](./testing.md)).
