# tiktak-backend

TikTak modüler monolit API.

**Stack:** Node 24 · Hono · Prisma (migrate) · Kysely (query) · Redis · BullMQ · Socket.IO · Zod-OpenAPI

```bash
pnpm install
pnpm local:up        # postgres + redis
pnpm db:generate
pnpm db:migrate
pnpm dev             # http://localhost:3001/api-test
```

| Ne            | URL                               |
| ------------- | --------------------------------- |
| API           | `http://localhost:3001/api-test`  |
| Docs (Scalar) | `.../docs`                        |
| OpenAPI       | `.../openapi.json`                |
| Health        | `.../health`                      |
| Socket.IO     | `http://localhost:3001/socket.io` |

---

## Klasörler

```
.
├── index.ts                 # listen + socket + shutdown
├── app.config.ts            # git’teki kararlar (secret değil)
├── server/                  # composition root — server/doc.md
├── apps/                    # yüzey + domain — apps/doc.md
├── modules/                 # prisma + repo — modules/doc.md
├── middlewares/             # auth / permission / rate-limit
├── core/                    # motor — core/doc.md
├── scripts/                 # duman / init — scripts/doc.md
└── docs/                    # mimari + standartlar
```

| Katman                               | Belge                        |
| ------------------------------------ | ---------------------------- |
| [apps/](./apps/doc.md)               | Yüzeyler, slice’lar, domain  |
| [modules/](./modules/doc.md)         | Tablo + repo indeksi         |
| [core/](./core/doc.md)               | Motor paketleri              |
| [middlewares/](./middlewares/doc.md) | Auth, permission, rate-limit |
| [server/](./server/doc.md)           | `buildServer`                |
| [scripts/](./scripts/doc.md)         | e2e / cache-socket           |

---

## Doküman haritası

| Doküman                                              | İçerik                            |
| ---------------------------------------------------- | --------------------------------- |
| [docs/getting-started.md](./docs/getting-started.md) | Kurulum, env, script’ler          |
| [docs/inceleme-sirasi.md](./docs/inceleme-sirasi.md) | Kod inceleme yolu                 |
| [docs/architecture.md](./docs/architecture.md)       | Katmanlar, bağımlılık yönü        |
| [docs/layers.md](./docs/layers.md)                   | Katman detayı                     |
| [docs/decisions.md](./docs/decisions.md)             | Ürün / teknoloji kararları        |
| [docs/api-standards.md](./docs/api-standards.md)     | Hono, Zod, OpenAPI, `defineRoute` |
| [docs/database.md](./docs/database.md)               | Prisma + Kysely                   |
| [docs/quality-tools.md](./docs/quality-tools.md)     | `pnpm verify` kalite kapısı       |
| [docs/testing.md](./docs/testing.md)                 | Test stratejisi + yol haritası    |
| [docs/README.md](./docs/README.md)                   | Tam indeks                        |

---

## Script’ler

| Script                                    | Ne                     |
| ----------------------------------------- | ---------------------- |
| `pnpm dev`                                | Local watch server     |
| `pnpm check`                              | `tsc --noEmit`         |
| `pnpm verify`                             | Kalite kapısı          |
| `pnpm local:up` / `down` / `reset`        | Docker                 |
| `pnpm db:generate` / `migrate` / `deploy` | Prisma                 |
| `node scripts/e2e-smoke.mjs`              | API duman (`E2E_BASE`) |
| `node scripts/test-cache-socket.mjs`      | Cache + socket duman   |

---

## İki temel kural

1. **Bağımlılık yönü:** `index → server → apps → middlewares + modules + platform → core`
2. **Kardeş import yasağı:** `apps/X` ↛ `apps/Y`. `core` tek paket (iç import OK, döngü yok). `modules` / `platform` serbest.

Detay: [docs/architecture.md](./docs/architecture.md)

---

## Sözleşme kuralları

- Wire üzerindeki **her anahtar `snake_case`** — request body, query, response, hata alanları.
- Hatalar RFC 9457 şeklinde: `type`, `title`, `status`, `code`, `trace_id`, opsiyonel `errors[]`.
- Sunucu **çevrilmiş metin göndermez**; istemci `code` üzerinden kendi kataloğundan çözer.
