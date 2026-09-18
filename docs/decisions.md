# Kesinleşmiş kararlar

> Klasör düzeni, katmanlar ve bağımlılık yönü bu dosyada **yok**. Güncel kaynak:
>
> - [architecture.md](./architecture.md)
> - [layers.md](./layers.md)
>
> Bu dosya yalnızca **ürün / teknoloji** kararlarıdır.

**Son güncelleme:** 2026-09-17

## Başlıklar

1. [Veritabanı motoru](#veritabanı-motoru)
2. [Runtime](#runtime)
3. [HTTP framework](#http-framework)
4. [ORM / veri katmanı](#orm--veri-katmanı)
5. [Validation](#validation)
6. [Job queue](#job-queue)
7. [Messaging](#messaging)
8. [Mimari (özet)](#mimari-özet)
9. [GraphQL Federation](#graphql-federation)
10. [Legacy v1 API](#legacy-v1-api)
11. [Frontend tip sözleşmesi](#frontend-tip-sözleşmesi)
12. [Error sistemi](#error-sistemi)
13. [Auth / session / presence](#auth--session--presence)
14. [Observability](#observability)
15. [Test, dokümantasyon ve ortamlar](#test-dokümantasyon-ve-ortamlar)

---

## Veritabanı motoru

| Alan             | Karar                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Karar**        | **PostgreSQL**                                                                               |
| **Gerekçe**      | Domain ilişkisel; mevcut şema korunur. Transaction, FK, soft delete, advisory lock zaten PG. |
| **Kapsam dışı**  | MongoDB / MySQL geçişi.                                                                     |

---

## Runtime

| Alan             | Karar                                                     |
| ---------------- | --------------------------------------------------------- |
| **Karar**        | **Node.js 24 LTS** (prod + geliştirme)                    |
| **Gerekçe**      | Uzun ömürlü monolit API; OTel Node’da olgun; tek runtime. |
| **Kapsam dışı**  | Bun / Deno production runtime.                            |

---

## HTTP framework

| Alan             | Karar                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Karar**        | **Hono** + `@hono/node-server`                                     |
| **Gerekçe**      | TS-first DX; `@hono/zod-openapi` ile validation + OpenAPI tek şema.|
| **Kapsam dışı**  | Express (yeni monolit), Fastify, Elysia.                           |

Route / HTTP yüzeyi: `core/http`.

---

## ORM / veri katmanı

| Alan             | Karar                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Karar**        | **Prisma migrate** (şema + migration) + **Kysely** (runtime) + **`prisma-kysely`** (tipler) |
| **Gerekçe**      | Brownfield şema riski migrate tarafında; runtime join/transaction için Kysely.               |
| **Kapsam dışı**  | Prisma Client (runtime), Drizzle, Sequelize / TypeORM.                                       |

### Şema sahipliği

| #   | Kural                                                                                          |
| --- | ---------------------------------------------------------------------------------------------- |
| 1   | Entity şemaları `modules/<entity>/*.prisma` (+ `modules/schema.prisma` generator).             |
| 2   | Migration SQL: `core/database/prisma/migrations/`.                                             |
| 3   | Değişiklik: `.prisma` → `prisma migrate` → SQL commit → `pnpm db:generate`.                    |
| 4   | Prod: yalnızca `prisma migrate deploy`.                                                        |
| 5   | Runtime: yalnızca **Kysely**.                                                                  |
| 6   | Elle ALTER kalıcı olamaz — aynı gün şema + migration ile geri yazılır.                         |
| 7   | Kysely tipleri türetilir: `core/database/generated/kysely/`.                                   |

### Repo = saf tablo I/O

| #   | Kural                                                                                |
| --- | ------------------------------------------------------------------------------------ |
| 1   | `modules/*.repo.ts` yalnızca okuma/yazma; iş kuralı yok.                             |
| 2   | Handler / domain Kysely yazmaz → `domain/` → repo.                                   |
| 3   | Use-case orkestrasyonu `apps/*/domain` içinde.                                       |

Kolon adları: Prisma / Kysely / satır tipleri **snake_case**.

---

## Validation

| Alan             | Karar                                                            |
| ---------------- | ---------------------------------------------------------------- |
| **Karar**        | **Zod** + **`@hono/zod-openapi`**                                |
| **Gerekçe**      | Hono + OpenAPI code-first; tip + runtime tek yer (`z.infer`).    |
| **Kapsam dışı**  | Joi, TypeBox / Valibot (yeni monolit).                           |

| #   | Kural                                                                  |
| --- | ---------------------------------------------------------------------- |
| 1   | API sözleşmesi Zod’da — `apps/*/*.schema.ts` + `core/fields`.          |
| 2   | DB şeması Prisma’da; Zod DB’nin yerine geçmez.                         |
| 3   | DB row ≠ API DTO.                                                      |
| 4   | Parse sınırı: handler öncesi OpenAPI / Zod middleware.                 |
| 5   | Zod issue → `VALIDATION_ERROR` + `errors[]`.                           |

---

## Job queue

| Alan             | Karar                                                   |
| ---------------- | ------------------------------------------------------- |
| **Karar**        | **BullMQ** (Redis) — tek kuyruk sistemi                 |
| **Gerekçe**      | Redis zaten var; retry / cron / priority olgun.         |
| **Kapsam dışı**  | Temporal, pg-boss (şimdi); ikinci paralel kuyruk.       |

Mail / push: `platform/notifications` → `core/queue`. Domain-kritik job’larda PG satırı + commit sonrası enqueue + idempotent worker.

---

## Messaging

| Alan             | Karar                                                                          |
| ---------------- | ------------------------------------------------------------------------------ |
| **Karar**        | Redis pub/sub (realtime) + BullMQ (iş/bildirim) + Socket.IO. Kafka day-1 yok.  |
| **Kapsam dışı**  | Day-1 Kafka; notification ayrı repo.                                           |

Realtime → `core/socket`. Bildirim sözleşmesi → `platform/notifications`.

---

## Mimari (özet)

| Alan             | Karar                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **Karar**        | **Modüler monolit** — tek API; Socket.IO API process içinde. Uygulama gateway yok.             |
| **Kapsam dışı**  | Domain başına mikroservis; app gateway.                                                        |
| **Repo sınırı**  | Monorepo yalnızca backend; web/mobile ayrı → OpenAPI + Orval.                                  |

Detay → [architecture.md](./architecture.md) · [layers.md](./layers.md).

---

## GraphQL Federation

| Alan      | Karar                                      |
| --------- | ------------------------------------------ |
| **Karar** | **Emekli** — yeni stack’e taşınmaz.        |

---

## Legacy v1 API

| Alan             | Karar                                              |
| ---------------- | -------------------------------------------------- |
| **Karar**        | Yalnızca **v2** REST; v1 yok.                      |
| **Path**         | `/core` / `/core/v2` prefix **yok**.               |

---

## Frontend tip sözleşmesi

| Alan             | Karar                                                         |
| ---------------- | ------------------------------------------------------------- |
| **Karar**        | OpenAPI code-first + **Orval** (web/mobile). Elle tip/hook yok.|
| **Kurallar**     | `operationId` zorunlu; `tags` yüzey/modül bazlı.              |

---

## Error sistemi

| Alan             | Karar                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Karar**        | RFC 9457 problem response + katalog + yakalanan hataların PG’ye yazılması.                |
| **Kapsam dışı**  | Kullanıcıya stack/SQL sızdırmak.                                                          |

i18n içerik: `platform/i18n`. HTTP hata borusu: `core/http` / `core/errors`.

| #   | Kural                                                              |
| --- | ------------------------------------------------------------------ |
| 1   | Success zarfı ≠ error (problem+json).                              |
| 2   | Wire: `type`, `title`, `status`, `code`, `traceId`, isteğe `errors[]`. |
| 3   | Validation: üst `VALIDATION_ERROR` + alan listesi.                 |
| 4   | Tek çıkış: Hono `onError` → response + persist.                    |
| 5   | `traceId` response / DB / log / OTel’de aynı.                      |
| 6   | i18n: stabil `code`; `title`/`detail` ← `Accept-Language`.         |

---

## Auth / session / presence

| Alan             | Karar                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Karar**        | jose (access JWT) + Redis session + opaque refresh (multi-device).                      |
| **Kapsam dışı**  | App gateway; access token’da permission/PII dump.                                      |

Yollar: `platform/auth` (session/claims) · `core/crypto` (JWT/hash/random) · `middlewares/auth`.

| #   | Kural                                                              |
| --- | ------------------------------------------------------------------ |
| 1   | Access claim min: `sub`, `sid`, `jti`, `iat`, `exp`.               |
| 2   | Refresh opaque; Redis rotation; replay’de session düşer.           |
| 3   | Session ≠ presence; presence socket connect/disconnect/heartbeat.  |
| 4   | Permissions Redis cache; rol değişince invalidate.                 |

---

## Observability

| Alan             | Karar                                        |
| ---------------- | -------------------------------------------- |
| **Karar**        | **Pino** + **OpenTelemetry**. Sentry day-1 yok.|
| **Kurallar**     | `traceId` ortak; `console.log` yok; PII redaction tek helper. |

---

## Test, dokümantasyon ve ortamlar

| Alan             | Karar                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| **Karar**        | Vitest + (hedef) Testcontainers E2E. Local-first + staging.            |
| **Kalite kapısı**| `pnpm verify` — [quality-tools.md](./quality-tools.md).                |
| **Local**        | `docker compose` PG + Redis.                                           |
