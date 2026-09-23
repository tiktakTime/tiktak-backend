# Mimari

Tek paket (`package.json`), tek API süreci.

| Katman               | Rol                                        |
| -------------------- | ------------------------------------------ |
| `core/`              | Motor — mekanizma + port (npm paketi gibi) |
| `platform/`          | Motoru TikTak’a bağlayan sağlayıcı katman  |
| `apps/` + `modules/` | HTTP yüzey + use-case · prisma/repo        |
| `server/`            | Composition root                           |

**Stack:** Node.js 24 · Hono · Prisma (migrate) · Kysely (query) · Redis · BullMQ · Socket.IO · Zod-OpenAPI

Kararlar: [decisions.md](./decisions.md) · Katman detayı: [layers.md](./layers.md) · Kalite: [quality-tools.md](./quality-tools.md)

---

## Kök yapı

```
.
├── index.ts
├── app.config.ts
├── server/               # Composition root — listen yok
├── platform/             # auth · scope · notifications · i18n
├── apps/                 # Yüzeyler: schema + routes + domain
│   ├── public/ | common/ | web/ | mobile/ | admin/
│   ├── auth/             # Melez auth routes (surfaces dışı)
│   └── system/
├── modules/              # prisma + repo
├── middlewares/
├── core/                 # Motor
└── scripts/
```

---

## Katman sorumlulukları

| Katman              | Ne yapar                                                       |
| ------------------- | -------------------------------------------------------------- |
| `apps/*/<slice>/`   | `.schema.ts` + `.routes.ts` + `domain/`                        |
| `modules/<entity>/` | `.prisma` + `.repo.ts` (+ sabitler)                            |
| `platform/*`        | Claims, scope anahtarları, i18n içeriği, bildirim sözleşmesi   |
| `middlewares/`      | auth, permission, rate-limit                                   |
| `core/`             | Port + mekanizma (`router`, `http`, `crypto`, redis, cache, …) |
| `server/`           | Tüm `configureX` / wiring                                      |
| `app.config.ts`     | Ürün sabitleri (git’te; secret değil)                          |

---

## Bağımlılık yönü

```
index.ts → server/ → apps/* → middlewares/ + modules/ + platform/* → core/
```

### Katmanlar arası

| Ok                                                       | Durum |
| -------------------------------------------------------- | ----- |
| `apps` → `modules` / `middlewares` / `platform` / `core` | ✅    |
| `middlewares` → `platform` / `core`                      | ✅    |
| `platform/*` → `core/`                                   | ✅    |
| `platform/X` → `platform/Y`                              | ✅    |
| `modules` → `core`                                       | ✅    |
| `modules` → `apps` / `platform`                          | ❌    |
| `platform` → `apps` / `modules`                          | ❌    |
| `core` → `apps` / `modules` / `middlewares` / `platform` | ❌    |

### Kardeş import yasağı (`apps` only)

| Yasak               | Örnek                                                             |
| ------------------- | ----------------------------------------------------------------- |
| `apps/X` ↛ `apps/Y` | `apps/web` → `apps/common` / `apps/public` / `apps/auth` **asla** |

**`core/`:** Tek mantıksal paket; klasörler birbirini import edebilir. Zorunlu: **döngü yok**. Detay: [`core/doc.md`](../core/doc.md).

**`modules/`:** `modules/X` → `modules/Y` serbest.

Aynı birim **içinde** relative import serbest.

---

## `modules/` — saf veri

```
modules/<entity>/
  <entity>.prisma
  enums.prisma      # varsa
  <entity>.repo.ts
  constants.ts      # varsa
```

`domain/` **yok** — kurallar `apps/<surface>/<slice>/domain/`.

---

## `apps/` — yüzey + domain

```
apps/web/person/
  person.schema.ts
  person.routes.ts
  domain/
    create.ts
    …
    index.ts
```

---

## İlgili dokümanlar

- [getting-started.md](./getting-started.md)
- [database.md](./database.md)
- [api-standards.md](./api-standards.md)
- [layers.md](./layers.md)
- [decisions.md](./decisions.md)
- Katman `doc.md`: [apps](../apps/doc.md) · [modules](../modules/doc.md) · [core](../core/doc.md) · [platform](../platform/doc.md) · [middlewares](../middlewares/doc.md) · [server](../server/doc.md) · [scripts](../scripts/doc.md)
