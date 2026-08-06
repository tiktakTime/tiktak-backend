# Database

Prisma (şema + migrate) + Kysely (runtime query).  
Yeni DB: `tiktak-v2` / `tiktak-test-v2`. Kaynak modeller: `tiktak-service-humans`.

## Kararlar

| Konu | Karar |
|------|--------|
| Taşıma | Modeller **tek tek** (veya bağımlı paket); bulk `prisma db pull` yok |
| Klasör | Her model: `prisma/<model>/` |
| Dosyalar | `<model>.prisma` + `enums.prisma` (gerekirse) + `<model>.md` |
| Comment / açıklama | Sadece `<model>.md` — migration’a `COMMENT ON` yok |
| Enum | **Prisma native** — model klasöründe `enums.prisma`; paylaşılan enum ilk tanımlayan klasörde |
| Tablo adı | Humans ile aynı (`role`, `person`, …); rename yok |
| Ertelenen FK | Hedef yoksa / audit: düz UUID; `@relation` sonra |
| Runtime | **Kysely** (`src/kysely/`). `generated/client` + `generated/zod` tooling |
| Env | `.env.local` (local Docker) / `.env` (remote) — `pnpm dev` / `dev:remote` |

## Klasör şablonu

```
prisma/
  schema.prisma
  migrations/
  <table_or_slug>/
    <name>.prisma
    enums.prisma    # optional
    <name>.md
```

## Mevcut modeller

| Klasör | Tablo | Humans |
|--------|-------|--------|
| `user/` | `user` | `user` |
| `country/` | `country` | `country` |
| `organization/` | `organization` | `organization` |
| `permission/` | `permission` | `permission` |
| `role/` | `role` | `role` |
| `role_permission/` | `role_permission` | `role_permission` |
| `person_permission/` | `person_permission` | `person_permission` |
| `person/` | `person` | `person` |
| `company/` | `company` | `company` |
| `address/` | `address` | `address` |
| `bank_account/` | `bank_account` | `bank_account` |
| `social_media/` | `social_media` | `social_media` |
| `invite/` | `invite` | `invite` |

Migration’lar: `20260806140000_user`, `20260806150000_core_org_models`, `20260806160000_person_permission`.

## Komutlar

```bash
pnpm db:generate
pnpm dev:local
pnpm dev:remote
pnpm db:deploy:local
pnpm db:deploy:remote
```

## Yeni model ekleme

1. Humans `model.js` oku.
2. `prisma/<model>/` — prisma + enums + md.
3. `prisma/migrations/<timestamp>_.../migration.sql`.
4. `src/kysely/` tiplerini güncelle + `pnpm db:generate` (Zod).
5. `db:deploy` (hedef DB’ye göre).
