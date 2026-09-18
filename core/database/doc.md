# database

İndeks: [`core/doc.md`](../doc.md) · Detay: [`docs/database.md`](../../docs/database.md) · Şema: [`modules/doc.md`](../../modules/doc.md)

**Dosyalar:** `db.ts`, `index.ts`, `prisma/migrations/`, `generated/kysely/` (üretilir)

Kysely query runtime + Prisma generator çıktısı (tipler / enum’lar). Tek DB istemcisi.

Barrel: `@/core/database`

---

## Amaç

Runtime’da tüm SQL Kysely ile; şema tanımı `modules/` altında Prisma birleşik schema. Migration SQL bu pakette; query tip güvenliği generated tiplerden gelir.

---

## `db.ts` — bağlantı

1. `pg.Pool` — `connectionString: env.DATABASE_URL`
2. Pool ayarları: `max: 50`, `min: 5`, idle/keepAlive timeout’ları
3. `Kysely<DB>` singleton — `globalThis.__db` (tsx watch socket leak önleme)
4. `closeDb()` → `db.destroy()` — shutdown sırasında

---

## Public yüzey

| Sembol                            | Açıklama                           |
| --------------------------------- | ---------------------------------- |
| `db`                              | Kysely `<DB>` singleton            |
| `closeDb()`                       | Pool kapat                         |
| `DB` (type)                       | Generated tablo tipleri            |
| `*` from `generated/kysely/enums` | Prisma enum’ları (`UserStatus`, …) |

---

## Şema ve migration

| Konum            | İçerik                                                                        |
| ---------------- | ----------------------------------------------------------------------------- |
| Şema kökü        | [`modules/schema.prisma`](../../modules/schema.prisma) + `modules/*/*.prisma` |
| Generated tipler | `core/database/generated/kysely/` (`prisma-kysely`)                           |
| Migration SQL    | `core/database/prisma/migrations/`                                            |

Komutlar: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:deploy`, `pnpm db:status`, `pnpm db:studio`.

Test DB: Docker init [`scripts/local/postgres-init/`](../../scripts/local/postgres-init/) → `tiktak-test-v2`.

---

## Bağımlılıklar

| Ne             | Nereden                 |
| -------------- | ----------------------- |
| `DATABASE_URL` | `@/core/env` (pooled)   |
| `DIRECT_URL`   | migrate/seed (unpooled) |
| Driver         | `pg` + `kysely`         |

---

## Tüketiciler

`modules/*.repo`, `apps/*/domain`, `apps/system/health` (readiness), `apps/auth` (doğrudan sorgular).

`core/database` ↛ `apps` / `modules` — yalnızca tipler import edilir, domain bilgisi yok.
