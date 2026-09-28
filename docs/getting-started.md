# Getting Started

Mimari: [architecture.md](./architecture.md) · Kararlar: [decisions.md](./decisions.md) · Kalite: [quality-tools.md](./quality-tools.md)

---

## Gereksinimler

- **Node.js** 24 LTS
- **pnpm** (sürüm kök `package.json` → `packageManager`)
- **Docker / OrbStack** — local Postgres + Redis

---

## Env dosyaları

| Dosya        | Kullanım                                        |
| ------------ | ----------------------------------------------- |
| `.env.local` | Local Docker (`pnpm dev`, tüm `db:*` komutları) |
| `.env`       | Remote / deploy (`pnpm start`)                  |

Bağlantı `LIVE` / `TEST` çifti olarak tutulur; `NODE_ENV=test` iken TEST tarafı seçilir. Seçim iki yerde yapılır: uygulama için `core/env/index.ts`, Prisma CLI için `prisma.config.ts`.

> Her iki dosya da git'te **takipli** — Docker image build'i onlara bağlı. Secret eklerken bunu unutma.

---

## İlk kurulum

```bash
pnpm install
pnpm local:up      # postgres + redis
pnpm db:generate   # Kysely tipleri → core/database/generated/
pnpm db:migrate    # şemayı uygula
pnpm dev
```

Ayağa kalkınca:

| Ne                         | Nerede                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| API                        | `http://localhost:3001/api-test`                                 |
| OpenAPI spec               | `{API_BASE_PATH}/openapi.json`                                   |
| Scalar UI (prod'da kapalı) | `{API_BASE_PATH}/docs`                                           |
| Health / readiness         | `{API_BASE_PATH}/health`, `.../health/ready`                     |
| Socket.IO                  | `http://localhost:3001/socket.io` (JWT gerekli; API prefix dışı) |
| Auth                       | `POST {API_BASE_PATH}/auth/sign-in` → access + refresh           |

Port ve prefix `.env.local` içindeki `PORT` / `API_BASE_PATH` ile değişir. `REDIS_URL` cache + session + rate-limit + BullMQ için; `JWT_SECRET` access token imzası için gerekli.

---

## Script'ler

| Script                         | Env          | Ne yapar                                   |
| ------------------------------ | ------------ | ------------------------------------------ |
| `pnpm dev`                     | `.env.local` | `tsx watch` ile server                     |
| `pnpm start`                   | `.env`       | `migrate deploy` + server (deploy yolu)    |
| `pnpm check`                   | —            | `tsc --noEmit`                             |
| `pnpm verify`                  | —            | format + check + lint + arch + dead + test |
| `pnpm format`                  | —            | Prettier                                   |
| `pnpm local:up` / `local:down` | —            | Docker compose                             |
| `pnpm local:reset`             | —            | Volume dahil sıfırla                       |
| `pnpm db:generate`             | `.env.local` | prisma-kysely tipleri                      |
| `pnpm db:migrate`              | `.env.local` | `migrate dev`                              |
| `pnpm db:deploy`               | `.env`       | `migrate deploy`                           |
| `pnpm db:status`               | `.env.local` | Migration durumu                           |
| `pnpm db:studio`               | `.env.local` | Prisma Studio                              |
| `pnpm db:test:clean`           | `.env.local` | Test DB tabloları + Redis db 15            |

---

## Proje yapısı

```
index.ts            # süreç entry — listen + graceful shutdown
app.config.ts       # uygulama kararları (cache, pagination, surfaces)
prisma.config.ts    # schema klasörü, migration yolu, CLI bağlantısı
server/             # buildServer() — server/doc.md
platform/           # auth · scope · notifications · i18n — platform/doc.md
apps/               # apps/doc.md
  public/
  common/<slice>/
  web/<slice>/
  mobile/ | admin/
  auth/
  system/
modules/<entity>/   # prisma — modules/doc.md
middlewares/        # middlewares/doc.md
core/               # core/doc.md
scripts/            # scripts/doc.md
```

`core/database/generated/` gitignore'da — `pnpm db:generate` üretir.

Katman belgeleri: [apps](../apps/doc.md) · [modules](../modules/doc.md) · [core](../core/doc.md) · [platform](../platform/doc.md) · [middlewares](../middlewares/doc.md) · [server](../server/doc.md) · [scripts](../scripts/doc.md)

---

## Prisma notları

- Şema **klasör** olarak okunur (`modules/`); her modül kendi `*.prisma` dosyasını taşır.
- Datasource `url` Prisma 7'de şemadan kaldırıldı; `prisma.config.ts` → `datasource.url`.
- Migration'lar `core/database/prisma/migrations/` altında.
- Runtime'da Prisma Client **yok** — sadece Kysely.
