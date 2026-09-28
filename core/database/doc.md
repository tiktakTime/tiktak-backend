# database

İndeks: [`core/doc.md`](../doc.md) · Detay: [`docs/database.md`](../../docs/database.md) · Şema: [`modules/doc.md`](../../modules/doc.md)

**Dosyalar:** `db.ts`, `index.ts`. `generated/kysely/` `pnpm db:generate` ile dolar. `prisma/migrations/` henüz yok.

Kysely bağlantı havuzu. `DB` tipi üretilen Kysely çıktısından gelir. İlk model `user`. Migration yazılmadı.

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

| Sembol      | Açıklama                             |
| ----------- | ------------------------------------ |
| `db`        | Kysely `<DB>` singleton              |
| `closeDb()` | Pool kapat                           |
| `DB` (type) | Üretilen tablo tipleri. Şu an `user` |

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

`modules/db.ts` üzerinden: `apps/system/health` (readiness), `index.ts` (kapanış), testler (`closeDb`).

`core/database` ↛ `apps` / `modules`.
