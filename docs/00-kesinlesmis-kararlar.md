# Kesinleşmiş kararlar

Bu dosya planlama sırasında **kilitlenen** kararları toplar.  
Henüz karar verilmemiş konular → [07-acik-sorular.md](./07-acik-sorular.md).

Tek tek eklenir; her satır geri alınmadan önce bilinçli tartışılmış olmalı.

**Son güncelleme:** 2026-08-06 — API path (prefix yok), POC sırası (user), uygulama fazları, auth/starter referansı.

## Başlıklar

1. [Veritabanı motoru](#veritabanı-motoru)
2. [Runtime](#runtime)
3. [HTTP framework](#http-framework)
4. [ORM / veri katmanı](#orm--veri-katmanı)
5. [Validation](#validation)
6. [Monorepo tooling](#monorepo-tooling)
7. [Job queue](#job-queue)
8. [Kapsam / migration](#kapsam--migration)
9. [Mimari](#mimari)
10. [Monorepo kapsamı](#monorepo-kapsamı)
11. [Modül yapısı](#modül-yapısı) — [factory riski](#kritik-bulgu-factorynin-kendisi-asıl-risk)
12. [Klasör düzeni](#klasör-düzeni)
13. [Taşıma / test stratejisi (yüksek seviye)](#taşıma--test-stratejisi-yüksek-seviye)
14. [GraphQL Federation](#graphql-federation)
15. [Legacy v1 API](#legacy-v1-api) — [API path prefix](#kritik-bulgu-api-path-prefix)
16. [Frontend tip sözleşmesi](#frontend-tip-sözleşmesi)
17. [Messaging](#messaging)
18. [Error sistemi](#error-sistemi) — [kritik bulgular](#kritik-bulgular-operasyonel-güvenlik-retention-pii-fallback-i18n)
19. [Auth / session / presence](#auth--session--presence)
20. [Observability](#observability) — [PII tutarlılığı](#kritik-bulgu-pii-tutarlılığı)
21. [Test, dokümantasyon ve ortamlar](#test-dokümantasyon-ve-ortamlar) — [kritik bulgular](#kritik-bulgular-hız-izolasyon-fixture-arşiv-senaryo-bağı)

---

## Veritabanı motoru

| Alan | Karar |
|------|-------|
| **Karar** | **PostgreSQL** |
| **Tarih** | 2026-07-31 |
| **Gerekçe** | Domain yoğun ilişkisel (work ↔ person ↔ vehicle ↔ settlement ↔ order). Mevcut şema (~90 tablo, 53 migration) korunacak. Transaction, foreign key, soft delete, `pg_advisory_lock` zaten PG üzerinde. Motor değişimi faydasız, risk yüksek. |
| **Kapsam dışı** | MongoDB / MySQL geçişi yok. (Logging gibi izole doküman ihtiyaçları ayrı değerlendirilebilir; ana domain PG.) |
| **Sonraki etki** | ORM: Prisma migrate + Kysely (aşağıda). Şema yeniden tasarlanmayacak. |

---

## Runtime

| Alan | Karar |
|------|-------|
| **Karar** | **Node.js 24 LTS** (production ve geliştirme) |
| **Tarih** | 2026-07-31 |
| **Gerekçe** | Uzun ömürlü Docker monolit API; darboğaz PostgreSQL (ham HTTP farkı önemsiz). OTel auto-instrumentation Node'da olgun. LTS güvenlik yaması ~Nisan 2028. 2026 prod tartışmaları (memory/RSS, regression, Anthropic stewardship) Bun aleyhine. Hibrit (Bun tooling) bilinçli elendi — tek runtime. |
| **Kapsam dışı** | Bun / Deno production runtime. |
| **Sonraki etki** | HTTP framework Hono seçildi (`@hono/node-server`). Package manager: **pnpm** (aşağıda). |

---

## HTTP framework

| Alan | Karar |
|------|-------|
| **Karar** | **Hono** + `@hono/node-server` (Node 24 üzerinde) |
| **Tarih** | 2026-07-31 |
| **Gerekçe** | TypeScript-first DX; `@hono/zod-openapi` ile validation + OpenAPI tek şemadan; 350 endpoint için daha az kalıp. Express greenfield için yetersiz. Fastify olgun ama Zod-OpenAPI + lemonerce/tiktak-backend referansları Hono yolunu kısaltır. Node adapter v2 ile performans mazereti kalktı. |
| **Kapsam dışı** | Express (yeni monolit), Fastify, Elysia (Bun-first). |
| **Sonraki etki** | Validation: **Zod** (aşağıda). OpenAPI code-first. ORM: Prisma migrate + Kysely (aşağıda). |

---

## ORM / veri katmanı

| Alan | Karar |
|------|-------|
| **Karar** | **Prisma migrate** (şema + migration) + **Kysely** (runtime query) + **`prisma-kysely`** (tip üretimi) |
| **Tarih** | 2026-07-31 |
| **Gerekçe** | Brownfield ~90 tablo: risk migrate tarafında. Prisma migrate olgun (`db pull`, baseline, `migrate deploy` + advisory lock). Runtime'da Prisma Client yok — ağır transaction / join / raw SQL için Kysely. `lemonerce` / `tiktak-backend` birebir bu stack. Edge/cold-start ihtiyacı yok (Node monolit). |
| **Kapsam dışı** | Pure Prisma Client (runtime). Drizzle. Sequelize / TypeORM (greenfield). |
| **Sonraki etki** | Validation: Zod + isteğe bağlı `zod-prisma-types`. Brownfield: `prisma db pull` → baseline → `migrate resolve`. |

### Kural: şemanın sahibi `schema.prisma`

| # | Kural |
|---|-------|
| 1 | **Tek kaynak:** PostgreSQL şemasının uygulama tarafındaki tek sahibi `packages/database/prisma/schema.prisma`. |
| 2 | **Değişiklik yolu:** kolon/tablo/index/FK değişikliği önce `schema.prisma` → `prisma migrate` → SQL migration commit → `prisma generate` (`prisma-kysely` tipleri). |
| 3 | **Prod:** yalnızca `prisma migrate deploy`. `migrate dev` / `db push` production'a yok. |
| 4 | **Runtime:** uygulama kodu sadece **Kysely** kullanır. Prisma Client production runtime'a girmez (dev tooling / Studio hariç). |
| 5 | **Elle ALTER yasak (kalıcı):** prod/staging'de acil DBA `ALTER` atılırsa aynı gün `schema.prisma` + migration ile geri yazılır. |
| 6 | **Kysely tipleri türetilir:** `DB` tipi elle yazılmaz; `prisma-kysely` çıktısı source of truth'tan üretilir. |

### Kural: `createRepo` (saf tablo I/O)

| # | Kural |
|---|-------|
| 1 | **`createRepo`** yalnızca tablo okuma/yazma; **iş kuralı yok**. |
| 2 | Teknik kolonlar (orgId, timestamp vb.) repo veya domain tarafında net ayrılır; Sequelize model hook’ları taşınmaz. |
| 3 | Modüller repo’yu **dışarı export etmez**; `operations/` handler içinde kullanır. |
| 4 | Özel sorgu: `createRepo(...).select()` veya modül içi ince query helper — iş kuralı yine `domain/`’de. |

---

## Validation

| Alan | Karar |
|------|-------|
| **Karar** | **Zod v4** + **`@hono/zod-openapi`** (request/response validation + OpenAPI) |
| **Tarih** | 2026-07-31 |
| **Gerekçe** | Hono kararı Zod-OpenAPI yolunu güçlendirdi. lemonerce/tiktak-backend aynı stack. Mevcut Joi (45 dosya) yerine TS-native şema; `z.infer` ile tip + runtime tek yer. |
| **Kapsam dışı** | Joi (legacy). TypeBox / Valibot (yeni monolit). |
| **Sonraki etki** | Request → Zod parse → domain; hata → [Error sistemi](#error-sistemi). OpenAPI code-first. DB satır tipleri Prisma/Kysely'den; API DTO'ları Zod'dan (ayrı katman). |

### Kural: Zod neyi doğrular, neyi sahiplenmez

| # | Kural |
|---|-------|
| 1 | **API sözleşmesi Zod'da:** body / query / params / response DTO şemaları Zod ile yazılır; OpenAPI bunlardan üretilir. |
| 2 | **DB şeması Prisma'da:** tablo/kolon/FK `schema.prisma` sahibidir. Zod DB şemasının yerine geçmez. |
| 3 | **İki katman bilinçli:** DB row ≠ API DTO. Gerekirse `zod-prisma-types` ile satır tiplerinden türet; endpoint input/output ayrı tutulur. |
| 4 | **Parse sınırı:** handler'a girmeden `safeParse` / OpenAPI middleware. |
| 5 | **Hata eşlemesi:** Zod issue'ları error wire şemasına (`VALIDATION_ERROR` + `errors[]`) ve DB Error modeline map edilir. |

### Kural: generated vs modül API şemaları (2026-08-06)

| # | Kural |
|---|-------|
| 1 | **`generated/zod` + `generated/kysely`:** `pnpm db:generate` ile migration sonrası; tablo **base** şeması; elle düzenlenmez. |
| 2 | **`packages/database/dto/*`:** repo katmanı — Kysely kolon listeleri, hassas alan ayrımı (`password_hash`); **OpenAPI response sözleşmesi değil**. |
| 3 | **API request/response Zod:** modül içinde, ilgili **contract’a özel elle** (`modules/*/*.contract.ts`, `*.types.ts`); zamanla DB row’dan ayrışır. |
| 4 | **POC istisna:** `UserPublicSchema` şimdilik `UserSchema.omit`; nihai response tipi modül contract’ına taşınacak. |
| 5 | **İsimlendirme:** DB kolon referansları **snake_case** (Prisma şema, Kysely, generated Zod). |

### Kural: DB kolon adları (snake_case)

| # | Kural |
|---|-------|
| 1 | Prisma model alanları doğrudan **snake_case** (`created_at`, `password_hash`); `@map` yok. |
| 2 | Kysely generator: `camelCase` kapalı — tipler DB ile aynı. |
| 3 | Tablo okuma/yazma ve generated Zod base şeması aynı isimleri kullanır. |

---

## Monorepo tooling

| Alan | Karar |
|------|-------|
| **Karar** | **pnpm workspaces** + **Turborepo** (`apps/*` + `packages/*` + `modules/`) |
| **Tarih** | 2026-07-31 (workspace: 2026-08-04 `modules/` eklendi) |
| **Gerekçe** | humans tek `package.json` + 16 serviste kopyalanmış altyapı → paylaşım sınırı yok. `api` / `worker` ayrı process; ortak `database`, `errors`, `auth` paketleri şart. lemonerce/tiktak-backend aynı yapı (onlar Bun PM; biz Node 24 → **pnpm**). |
| **Kapsam dışı** | Nx. Tek root `package.json` (tüm kod tek paket). Bun / yarn PM. Domain entity'lerini ayrı npm paketi yapmak. |
| **Sonraki etki** | Repo: `apps/api|worker`, `packages/*`, `modules/`. `packageManager: pnpm@…`. CI: `pnpm turbo run check/build`. |

### Kural: ne paket, ne klasör

| # | Kural |
|---|-------|
| 1 | **apps = süreç:** deploy edilebilir programlar (`api`, `worker`). Uygulama gateway app **yok**. |
| 2 | **packages = paylaşım:** birden fazla app'in kullandığı katmanlar (`database`, `errors`, `auth`, `env`, `module-kit`, `socket`, …). |
| 3 | **modules/ = domain:** iş kuralları ve operasyonlar kök `modules/` altında; `@tiktak/modules` workspace paketi. |
| 4 | **Kök `package.json` orkestra:** workspaces + turbo script'leri; asıl bağımlılıklar alt paketlerde. |
| 5 | **PM kilidi:** `packageManager` alanı **pnpm**; runtime Node 24 — Bun hibrit tooling yok. |
| 6 | **Pipeline:** `database#db:generate` → app `check`/`build` (Turbo `dependsOn`). |

---

## Job queue

| Alan | Karar |
|------|-------|
| **Karar** | **BullMQ** (Redis) — tek kuyruk sistemi |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Redis session için zaten var; PG darboğaz — kuyruk yükünü PG'ye bindirmemek. Retry, backoff, cron, priority, rate limit, Bull Board, OTel olgun. Mevcut `setInterval` + `pg_advisory_lock` worker'ları (work/order) ve settlement hesap tetikleri bununla değişir. |
| **Kapsam dışı** | Temporal (şimdi). pg-boss / Graphile Worker (şimdi). İkinci paralel kuyruk sistemi. |
| **Sonraki etki** | `apps/worker`. Messaging: Redis + BullMQ (aşağıda). Domain-kritik akışlarda aşağıdaki kural zorunlu. |

### Kural: domain-kritik job — DB kaynak, kuyruk tetik

| # | Kural |
|---|-------|
| 1 | **Tek gerçek kaynak:** İşin varlığı ve durumu PostgreSQL job/domain satırında. |
| 2 | **Aynı transaction:** Domain state değişikliği + job satırı birlikte commit. |
| 3 | **BullMQ tetikleyici:** Commit **sonrası** `queue.add`. |
| 4 | **Sweep:** Periyodik worker `QUEUED` satırlarını tarayıp eksik tetikleri yeniden enqueues eder. |
| 5 | **Idempotent worker:** Aynı job iki tetik alsa bile güvenli. |
| 6 | **Basit işler:** Mail, push, cron — doğrudan BullMQ yeterli; ayrı DB job satırı şart değil (ihtiyaca göre). |

---

## Kapsam / migration

| Alan | Karar |
|------|-------|
| **Karar** | **Greenfield kod** + **mevcut PostgreSQL şeması korunur** |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Polyrepo JS (Express/Sequelize/Joi) TypeScript monorepo olarak yeniden yazılır. Domain veri modeli (~90 tablo) production’da; şema redesign riski yüksek. Kod sıfırdan → clean architecture + kilitlenen stack. |
| **Kapsam dışı** | Mevcut humans/core kodunu “çalışır halde taşımak”. DB motoru / şema big-bang redesign. |
| **Sonraki etki** | `prisma db pull` + baseline. Taşıma: modül modül (aşağıda). |

---

## Mimari

| Alan | Karar |
|------|-------|
| **Karar** | **Modüler monolit** — tek API kod tabanı; **process:** `api` + `worker`. **Realtime (socket) API process içinde** (`packages/socket`). **Uygulama gateway yok.** |
| **Tarih** | 2026-08-01 (socket: 2026-08-04 revize — ayrı `apps/socket` yok) |
| **Gerekçe** | 17 mikroservis kopya altyapı maliyeti. Domain tek API’de birleşir; polyrepo auth-proxy gateway’e gerek kalmaz. Socket kodu paylaşılan pakette; deploy başlangıçta tek process (scale gerekirse ayrı process’e taşınabilir). Worker: BullMQ. TLS/routing için nginx/Traefik **altyapı** proxy kalabilir. |
| **Kapsam dışı** | `tiktak-service-gateway` benzeri uygulama gateway. Domain başına mikroservis. |
| **Sonraki etki** | `apps/api`, `apps/worker`. Auth: API middleware (`packages/auth`). Messaging: Redis pub/sub + BullMQ. |

---

## Monorepo kapsamı

| Alan | Karar |
|------|-------|
| **Karar** | Monorepo **sadece backend** (`tiktak-backend`) |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | `tiktak-web-v2` / `tiktak-mobile-v2` ayrı repo kalır. Ortak tip paketi monorepo içinden paylaşılmaz → OpenAPI codegen. |
| **Kapsam dışı** | Web + mobile’ı aynı monorepo’ya almak (şimdi). |
| **Sonraki etki** | Frontend sözleşme: OpenAPI + Orval. |

---

## Modül yapısı

| Alan | Karar |
|------|-------|
| **Karar** | Kök **`modules/`** (`@tiktak/modules`). Modül = **`defineModule`**; HTTP operasyon = **`defineOperation`**. Altyapı: `packages/module-kit`. |
| **Tarih** | 2026-08-03 (katman: 2026-08-04 güncellendi) |
| **Gerekçe** | web-v2’de **350 operasyon**: **%63 CRUD**, **%37 özel**. Sabit 6 dosyalı şablon (contract/routes/repo/service) her modüle aynı maliyeti yüklüyordu. Config’ten CRUD üretmek boilerplate’i siler; özel operasyonlar `operations/*.ts` kalır. |
| **Kapsam dışı** | Her modüle sabit dosya şablonu. Domain kodunu `packages/` altına koymak. |
| **Sonraki etki** | Factory doğrulama modülü **`user`** (CRUD, uçtan uca test). **`work`** ve diğer domain modülleri altyapı + user POC sonrası taşınır. `packages/module-kit` klasörü kalır; API detayları user POC sırasında netleşir, sonra dondurulur. |

### Kural: modül dosya düzeni

| # | Kural |
|---|-------|
| 1 | **`index.ts`:** `defineModule({ … operations, crud? … })`. |
| 2 | **`operations/<ad>.ts`:** `defineOperation` — HTTP handler girişi. |
| 3 | **`domain/`:** iş kuralları — **saf fonksiyonlar**; DB/HTTP yok. Tek kural uygulama yeri. |
| 4 | **`docs/`, `__tests__/`:** modül dokümantasyonu ve senaryo testleri. |
| 5 | **Repo:** `createRepo` modül içinde kullanılır; **export edilmez**. |
| 6 | **`key` tek kaynak:** operationId, audit, cache invalidation, FE query key aynı `key`’den türetilir. |

### Kural: handler akışı (`operations/`)

| # | Kural |
|---|-------|
| 1 | **Orchestration yalnızca `operations/`:** collect input → `domain/` → repo → `afterCommit`. |
| 2 | **İş kuralı `domain/` dışında yazılmaz** (service/repo/hook anti-pattern elendi). |
| 3 | **`invalidates`:** boot’ta doğrulanır; cache scope zorunlu (`org` / `user` / `global`). |
| 4 | **CRUD:** mümkünse `defineModule` config’inden; özel ihtiyaç → `defineOperation`. |

### Kritik bulgu: factory'nin kendisi asıl risk

| # | Kural |
|---|-------|
| 1 | **POC hedefi factory:** modül **`user`** — CRUD + uçtan uca test. `work` (CRUD + özel operasyon + transaction) domain taşıması fazında. |
| 2 | **Kabul:** uçtan uca tip akışı (`any` kaçışı yok) — tablo → handler → response → OpenAPI → Orval. |
| 3 | **Config donması:** `crud` seçenek kümesi POC sonunda dondurulur; yeni ihtiyaç `defineOperation`. |

---

## Klasör düzeni

| Alan | Karar |
|------|-------|
| **Karar** | **Next.js tarzı isimlendirilmiş klasörler** — generic `src/` wrapper yok |
| **Tarih** | 2026-08-04 |
| **Gerekçe** | İlgili kod ilgili klasörde; `packages/cache/provider/` gibi. Küçük paketlerde (`env`, `logger`) dosya doğrudan paket kökünde olabilir. |
| **Örnek** | `apps/api/app/`, `apps/api/middleware/`, `packages/http/app/`, `packages/socket/server/`, `modules/user/domain/`, `modules/user/operations/` |
| **Kapsam dışı** | Tüm paketlerde zorunlu `src/` katmanı. |

---

## Taşıma / test stratejisi (yüksek seviye)

| Alan | Karar |
|------|-------|
| **Karar** | Modüller **tek tek** taşınır; her modülle **doküman + senaryo testleri + sonuç arşivi**. Detay → [Test, dokümantasyon ve ortamlar](#test-dokümantasyon-ve-ortamlar). |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Big-bang riski yüksek. Kalite: önce sözleşme (doküman/test), sonra kod. |
| **Kapsam dışı** | Tüm domain’i testsiz taşımak. |
| **Sonraki etki** | Sıra: altyapı → `user` factory POC → domain modülleri (person, work, …). AGENTS.md: doküman değişince önce test. |

---

## Uygulama sırası (geçiş)

| Alan | Karar |
|------|-------|
| **Karar** | Geçiş **uygulama çalışır haldeyken** faz faz; domain/model taşıması **en son**. |
| **Tarih** | 2026-08-06 |
| **Faz 0** | **Database** — `packages/database` (Prisma migrate + Kysely). Modeller **tek tek** humans → yeni DB (`tiktak-v2`); bulk `db pull` yok. Klasör: `prisma/<model>/` + native enum. Detay: `docs/database.md`. İlk model: `user`. |
| **Faz 1** | **Altyapı** — auth, cache, http/errors, env, logger, … (`tiktak-backend` referans; kararlar araç seçimi). |
| **Faz 2** | **`module-kit`** — klasör kalır; mount/registry iskeleti user POC ile netleşir (API sonra evrilebilir). |
| **Faz 3** | **`modules/user` POC** — factory + CRUD; uçtan uca test edilebilir. |
| **Faz 4** | **Domain / model taşıması** — humans → `modules/` (person, work, organization, …). |

---

## GraphQL Federation

| Alan | Karar |
|------|-------|
| **Karar** | **Emekli** — yeni monorepo’ya **taşınmaz** |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Frontend `/graphql` kullanmıyor. Apollo Gateway + subgraph taşıma maliyeti gereksiz. |
| **Kapsam dışı** | GraphQL’i yeni stack’e port etmek. |

---

## Legacy v1 API

| Alan | Karar |
|------|-------|
| **Karar** | **Yok** — yalnızca **v2** REST sözleşmesi |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | humans’ta v1 + farklı response formatı; greenfield fırsatında v1 kesilir. |
| **Kapsam dışı** | `/core` legacy path’lerini birebir yeniden yazmak. |

### Kural: API path (prefix yok)

| # | Kural |
|---|-------|
| 1 | **`/core` ve `/core/v2` prefix’i yok.** Route’lar app root’tan mount edilir (örn. `/user/search`, `/auth/login`). |
| 2 | humans’taki `/core/v2/...` yolları **eski sözleşme**; domain taşımasında path eşlemesi yeni sözleşmeye göre yapılır. |
| 3 | web cutover: Orval / `api-routes` yeni OpenAPI path’lerinden; eski `/core/v2` birebir taşınmaz. |

---

## Frontend tip sözleşmesi

| Alan | Karar |
|------|-------|
| **Karar** | **OpenAPI code-first** + **Orval** (web/mobile). Elle API tip/hook yazımı yok. |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Zod + `@hono/zod-openapi` kilitli; monorepo backend-only. web-v2 TanStack Query + `apiFetch`; Orval mutator ile mevcut HTTP katmanı korunur. |
| **Kapsam dışı** | Frontend’te API tiplerini/hook’ları elle sürdürmek. |
| **Sonraki etki** | BE: `operationId` + `tags`. Spec export (`openapi.json`). FE: Orval + `apiFetch` mutator. |

### Kural: OpenAPI → Orval

| # | Kural |
|---|-------|
| 1 | **Kaynak:** Backend OpenAPI; FE sözleşmesi bu dosyadan. |
| 2 | **`operationId` zorunlu:** kısa okunabilir id. |
| 3 | **`tags`:** modül bazlı; Orval `tags-split`. |
| 4 | **Mutator:** web `apiFetch`; default fetch day-1 kullanılmaz. |
| 5 | **Geçiş:** modül modül; generated + elle hook yan yana yaşayabilir. |

---

## Messaging

| Alan | Karar |
|------|-------|
| **Karar** | **Redis pub/sub** (realtime fan-out) + **BullMQ** (güvenilir bildirim/iş). **Kafka day-1 yok.** |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Mevcut Kafka pratikte socket + notification köprüsü; modüler monolit + BullMQ ile ayrı bus şart değil. Redis session için zaten var. |
| **Kapsam dışı** | Day-1 Kafka cluster. Notification’ı ayrı GitHub repo. |
| **Sonraki etki** | API → Redis → socket (aynı process veya ileride ayrı). Bildirim → BullMQ → worker. |

### Kural: notification / multi-device

| # | Kural |
|---|-------|
| 1 | **Monolit içi modül:** notification domain’i `modules/` altında (ayrı repo değil). |
| 2 | **Worker:** push, mail, batch → BullMQ consumer. |
| 3 | **Realtime:** bağlı client’lara event → Redis pub/sub → `packages/socket`. |
| 4 | **Güvenilir bildirim:** kuyruk + (ihtiyaca) PG kaydı; yalnız pub/sub’a güvenilmez. |
| 5 | **Presence:** Redis (+ gerekirse PG audit); Kafka şart değil. |

---

## Error sistemi

| Alan | Karar |
|------|-------|
| **Karar** | **Redesign (C):** RFC 9457 tabanlı problem response + okunabilir katalog + **her hatanın PostgreSQL’e yazılması**. Eski 748 numerik katalog **birebir taşınmaz**. |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Success/error aynı zarfta karışmasın. Greenfield + OpenAPI codegen ile FE cutover mümkün. Anlam korunarak yeniden düzenlenir. |
| **Kapsam dışı** | Eski numerik katalogu birebir kopyalamak. Kullanıcıya stack/SQL sızdırmak. |
| **Sonraki etki** | `packages/errors` + `schema.prisma` Error modeli. Merkezi boru + PII redaction + persist→Pino fallback. |
| **Catalog migrasyonu** | Humans `catalog.meta.json` + 6 locale **taşınır** (domain kuralları). Yapı RFC 9457’ye uyarlanır; kodlar korunur. **Zamanlama: en son** — önce altyapı + user POC; seed catalog yeterli. Detay: `.cursor/cross-project/error-catalog.md`. |

### Kural: response (client’a giden)

| # | Kural |
|---|-------|
| 1 | **Success ≠ error:** Success `{ data, meta? }`. Error: problem+json ayrı şema. |
| 2 | **Error wire:** `type`, `title`, `status`, `code`, `traceId`, isteğe `errors[]`. |
| 3 | **Validation:** üst `VALIDATION_ERROR` + alan listesi. |
| 4 | **Katalog:** stabil kodlar (`WORK_CONFLICT`, `FORBIDDEN`, …). |
| 5 | **OpenAPI:** Error şeması `$ref`; Orval error tipi mümkünse enum/literal. |

### Kural: persistence (her hata DB’ye)

| # | Kural |
|---|-------|
| 1 | Uygulama içinde yakalanan **her** hata PostgreSQL’e yazılır. |
| 2 | Model: `type`, `code`, `httpStatus`, `traceId`, `path`, `userId?`, `organizationId?`, `payload` (JSONB), `createdAt`, … |
| 3 | Yoğunlukta BullMQ ile async persist; **kayıp olmamalı**. |

### Kural: boru (merkezi yakalama)

| # | Kural |
|---|-------|
| 1 | **Tek çıkış:** Hono `onError` — response + DB. |
| 2 | **Akış:** Zod → validation + DB; `AppError` → katalog + DB; unknown → `INTERNAL` + DB + OTel/Pino. |
| 3 | **Yasak:** Boş `catch`, DB’ye yazmadan yutmak. |
| 4 | **`traceId`:** Response, DB, log/OTel aynı id. |

### Kritik bulgular (operasyonel güvenlik: retention, PII, fallback, i18n)

| # | Kural |
|---|-------|
| 1 | **Retention:** `type` bazlı saklama; validation kısa; partition/cron ile temizlik. |
| 2 | **PII redaction:** Error DB ile Pino aynı maskeleme listesi. |
| 3 | **Persist fallback:** PG yazılamazsa Pino + `traceId`; kayıp olmamalı. |
| 4 | **i18n:** stabil `code`; `title`/`detail` `Accept-Language` (6 dil). |
| 5 | **Senaryo testi:** HTTP status + beklenen `code` assert. |

---

## Auth / session / presence

| Alan | Karar |
|------|-------|
| **Karar** | **jose** (ince access JWT) + **Redis session** + **opaque refresh** (multi-device). Auth **API middleware** içinde; `packages/auth` ortak. Socket handshake aynı verify. |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Uygulama gateway / `crypted-jwt` / `rediskey` proxy gereksiz. Token’da member dump anti-pattern. Kısa access JWT + sunucu session. |
| **Kapsam dışı** | Uygulama gateway process. Access token’da permission dump. `crypted-jwt`. |
| **Sonraki etki** | Login/refresh/logout `apps/api`. bcrypt mevcut hash; argon2 kademeli. Permission slug middleware korunur. |
| **Uygulama referansı** | Session, Redis, auth middleware iskeleti → workspace **`tiktak-backend`** (`packages/auth`, `packages/cache`, `packages/middlewares`). Araç seçimi bu dosyada; bağlantı deseni starter’dan uyarlanır. Stub auth yok. |

### Kural: token modeli (ince JWT)

| # | Kural |
|---|-------|
| 1 | **Access claim (min):** `sub`, `sid`, `jti`, `iat`, `exp`. |
| 2 | **Yasak:** rol/permission/PII dump token’da değil. |
| 3 | **Refresh:** opaque; Redis rotation; replay’de session düşer. |
| 4 | **Kütüphane:** **jose**. |

### Kural: session vs presence

| # | Kural |
|---|-------|
| 1 | **Session:** auth + refresh + device metadata. |
| 2 | **Permissions:** Redis cache; rol değişince invalidate. |
| 3 | **Presence:** socket connect/disconnect/heartbeat; her API call’da yazılmaz. |

### Kural: nerede çalışır

| # | Kural |
|---|-------|
| 1 | **API:** auth middleware → session → permission. |
| 2 | **Socket:** handshake’te aynı `packages/auth`. |
| 3 | **Altyapı:** nginx/Traefik yalnızca TLS/routing. |

---

## Observability

| Alan | Karar |
|------|-------|
| **Karar** | **Pino** (yapılandırılmış log) + **OpenTelemetry** (trace / metrics). **Sentry day-1 yok.** |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Exception kaydı Error tablosu + log ile karşılanır. Node 24’te OTel olgun. |
| **Kapsam dışı** | Day-1 Sentry. Validation flood exception UI. |
| **Sonraki etki** | `api` / `worker` ortak telemetry. Exporter deploy kararı. |

### Kural: bağlar

| # | Kural |
|---|-------|
| 1 | **`traceId`:** request başında; Pino, OTel, error response, Error DB aynı id. |
| 2 | **Pino:** `console.log` yerine; PII/secret log’a yazılmaz. |
| 3 | **OTel:** tüm app process’lerinde. |
| 4 | **Sentry:** day-1 yok. |
| 5 | **Exception panosu:** Error PG + Pino/OTel; validation flood UI’ye basılmaz. |

### Kritik bulgu: PII tutarlılığı

**Bulgu:** Log’da PII yasakken Error DB’de maskeleme yoksa disiplin delinir.

**Sonuç:** Error redaction ile Pino PII listesi **aynı kaynak** (tek helper).

---

## Test, dokümantasyon ve ortamlar

| Alan | Karar |
|------|-------|
| **Karar** | **Vitest** + **Testcontainers** (API senaryo E2E). Doküman–test–sonuç üçlüsü modül yanında. Local-first + staging. |
| **Tarih** | 2026-08-01 |
| **Gerekçe** | Kaliteli taşıma: kritik senaryolar gerçek PG/Redis ile doğrulanır. Offline geliştirme şart. |
| **Kapsam dışı** | Test sonuçlarını PostgreSQL’e yazmak. Shadow DB’yi E2E DB sanmak. |
| **Sonraki etki** | Modül: `docs/` + `__tests__/` + CI artifact. `docker compose` local. AGENTS.md disiplini. |

### Kural: test araçları

| # | Kural |
|---|-------|
| 1 | **Runner:** Vitest. |
| 2 | **DB/Redis:** Testcontainers. |
| 3 | **Ana E2E:** API senaryo — HTTP + gerçek DB. |
| 4 | **Unit:** Vitest; E2E’yi tamamlar. |
| 5 | **UI E2E:** web/mobile repo — backend zorunluluğu değil. |

### Kural: doküman → test → kod

| # | Kural |
|---|-------|
| 1 | Kural/doküman değişince **önce** test, **sonra** kod. |
| 2 | Senaryolar testlenebilir id ile (`work.conflict.employee_exit`). |
| 3 | AGENTS.md bu sırayı dayatır. |

### Kritik bulgular (hız, izolasyon, fixture, arşiv, senaryo bağı)

| # | Kural |
|---|-------|
| 1 | **Template DB:** migrate bir kez → template; her test/worker hızlı clone. |
| 2 | **Paralel izolasyon:** worker başına ayrı database (veya transaction rollback — POC’ta seçim). |
| 3 | **Fixture:** `packages/test-fixtures` factory; FK zinciri tekrarlanmaz. |
| 4 | **POC ölçümü:** senaryo suite süresi kabul edilebilir mi ölçülür. |
| 5 | **Senaryo kataloğu** commit’li; **run sonuçları** commit edilmez (CI artifact). |
| 6 | CI/script: dokümandaki her senaryo id’sinin testi var mı kontrol eder. |

### Kural: ortamlar (local / staging / prod)

| # | Kural |
|---|-------|
| 1 | **Local-first:** `docker compose` PG + Redis. |
| 2 | **Prod:** aynı app/migrate; fark env. |
| 3 | **Staging:** ayrı staging PG/Redis. |
| 4 | **Prisma shadow DB:** yalnızca migrate diff — uygulama testi değil. |
| 5 | Local/test/staging/prod DB **karıştırılmaz**. |
| 6 | **CI:** Testcontainers için Docker şart. |
