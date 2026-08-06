# Getting Started

## Prerequisites

- **Node.js** 24 LTS
- **pnpm** (see `packageManager` in root `package.json`)
- **Docker** — only for **local** mode (`pnpm dev`)

## Env files

| File | Use |
|------|-----|
| `.env.local` | Docker Postgres/Redis/MinIO on localhost (default for `dev` / `db:*`) |
| `.env` | Remote host (publish / `*:remote`) |

`pnpm dev` dosya yoksa example’dan kopyalamaz; branch’te commit’li `.env` / `.env.local` kullanılır.

**Env politikası:** Dosyalar image içinde olmalı. Her branch’te bir kez commit edilir; `.gitignore`’da kalırlar (yeni untracked kopyaları engeller). `test` / `main` env’leri farklıdır — merge sırasında `.gitattributes` (`merge=ours`) ile üzerine yazılmaz. Bilinçli güncelleme: `git add -f .env .env.local`.

## Install

```bash
pnpm install
pnpm db:generate
```

## Run — local (Docker)

1. Start OrbStack / Docker Desktop.
2. Migrate once:

```bash
pnpm db:deploy:local
```

3. Dev server:

```bash
pnpm dev
```

API: `http://localhost:3001` (see `PORT` in `.env.local`).

## Run — remote / deploy

`pnpm start` (and Docker `CMD`) runs **`prisma migrate deploy`** against the active `DIRECT_URL`, then starts the API. Local `pnpm dev` does **not** migrate.

Optional: `SKIP_DB_MIGRATE=1` to skip migrations on start.

```bash
pnpm start
```

## Scripts

| Script | Docker | Env file | Migrate |
|--------|--------|----------|---------|
| `pnpm dev` | Required (compose up) | `.env.local` | Hayır — elle `pnpm db:migrate` |
| `pnpm start` | — | `.env` / container env | Evet — `migrate deploy` |
| `pnpm db:migrate` | — | `.env.local` | Local geliştirme (`migrate dev`) |
| `pnpm db:studio` | — | `.env.local` | — |

## Renaming template

```bash
./scripts/setup.sh --name tiktak-backend --scope tiktak --skip-git
```
