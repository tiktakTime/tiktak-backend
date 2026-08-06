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

`pnpm dev` / `dev:remote` (ve db script’leri) dosya yoksa ilgili example’dan **otomatik kopyalar**; mevcut dosyayı asla üzerine yazmaz.

Do not commit `.env` / `.env.local`.

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

## Run — remote

Docker not required. Uses root `.env`.

```bash
pnpm db:deploy:remote   # only when you intend to migrate the remote DB
pnpm dev:remote
```

## Scripts

| Script | Docker | Env file |
|--------|--------|----------|
| `pnpm dev` / `dev:local` | Required (compose up) | `.env.local` |
| `pnpm dev:remote` | Skipped | `.env` |
| `pnpm db:deploy:local` / `db:migrate:local` | — | `.env.local` |
| `pnpm db:deploy:remote` / `db:migrate:remote` | — | `.env` |
| `pnpm db:studio:local` / `db:studio:remote` | — | matching env |

## Renaming template

```bash
./scripts/setup.sh --name tiktak-backend --scope tiktak --skip-git
```
