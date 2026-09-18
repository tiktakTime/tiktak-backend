# Katmanlar

[architecture.md](./architecture.md) özetini genişletir. Teknoloji kararları → [decisions.md](./decisions.md).

**Son güncelleme:** 2026-09-17

---

## Karar tablosu

| Konu              | Karar                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| Paket yönetimi    | Tek root `package.json`                                                         |
| Process           | `index.ts` dinler; `server/` compose (`listen` yok)                             |
| Config            | `app.config.ts` (git); secret → `core/env`                                      |
| Yüzeyler          | `apps/{public,common,web,mobile,admin}`                                         |
| Domain kuralları  | **`apps/<surface>/<slice>/domain/`** — `modules/` içinde domain **yok**         |
| Authsuz           | `apps/public`                                                                   |
| Melez auth        | `apps/auth` — surfaces dışı                                                     |
| Sistem            | `apps/system`                                                                   |
| HTTP sözleşme Zod | `core/fields` + `core/http`                                                     |
| Modüller          | `modules/` = prisma + repo (+ sabitler); route yok                              |
| Platform          | `platform/` = auth · scope · notifications · i18n                               |
| Middleware        | root `middlewares/`                                                             |
| Motor             | `core/`                                                                         |
| **Kardeş import** | **`apps/X`↛`apps/Y`**. `core` = tek paket (iç OK, döngü yok). `modules` serbest |
| Import alias      | `@/*` → repo kökü                                                               |

---

## 1. `apps/` — yüzeyler + domain

| Yüzey              | Auth    | Rol                                      |
| ------------------ | ------- | ---------------------------------------- |
| `public`           | Yok     | Token uçları (invite accept, …)          |
| `common`           | Zorunlu | Paylaşılan contract (user, organization) |
| `web`              | Zorunlu | Yönetim / `policy[]`                     |
| `mobile` / `admin` | Zorunlu | Şimdilik stub                            |
| `auth`             | Melez   | Surfaces dışı                            |
| `system`           | —       | health/ready                             |

### Slice

```
apps/web/person/
  person.schema.ts
  person.routes.ts
  domain/
    create.ts
    index.ts
    doc.md
  doc.md
```

Handler Kysely yazmaz → `domain/` → `modules/*.repo`.

İndeks: [`apps/doc.md`](../apps/doc.md).

---

## 2. `modules/` — saf veri

```
modules/user/
  user.prisma
  enums.prisma
  user.repo.ts
  constants.ts   # varsa
  doc.md
```

`domain/` **yok**. Çok tablolu iş `apps/*/domain` içinde orkestre edilir.

İndeks: [`modules/doc.md`](../modules/doc.md).

---

## 3. `platform/` — motoru ürüne bağlar

| Klasör          | Rol                                              |
| --------------- | ------------------------------------------------ |
| `auth`          | Claims, session, JWT+Redis verify                |
| `scope`         | Org/member anahtarları, hydrate, socket odası    |
| `notifications` | MailJob, şablon anahtarları, FE link             |
| `i18n`          | EN/TR/DE bundles + catalog.meta                  |

`platform` → `core` ✅ · `platform` ↛ `apps` / `modules`.

İndeks: [`platform/doc.md`](../platform/doc.md).

---

## 4. `middlewares/` / `server/` / `core/`

| Katman         | Rol                                                                |
| -------------- | ------------------------------------------------------------------ |
| `middlewares/` | auth, permission, rate-limit — ince; `platform` + `core` kullanır  |
| `server/`      | Composition root — `configureX`, mount; domain/Kysely yazmaz       |
| `core/`        | Motor — domain yok; yukarı bakmaz                                  |

---

## 5. Kardeş import

| Kural                                   | Anlam                                   |
| --------------------------------------- | --------------------------------------- |
| `apps/web` ↛ `apps/*`                   | Başka yüzey import yok                  |
| `core/*` → `core/*`                     | ✅ Serbest (tek paket); **döngü yasak** |
| `modules/user` → `modules/user_profile` | ✅ Serbest                              |
| `platform/X` → `platform/Y`             | ✅ Serbest                              |

Paylaşım (HTTP zarfı, enum) → tercihen `core/`. Apps yüzeyleri birbirinden tip/domain almaz.

---

## 6. Anti-pattern

| Yapma                                  | Neden                              |
| -------------------------------------- | ---------------------------------- |
| `modules/*/domain`                     | Domain `apps` altında              |
| `modules` → `apps` şema tipi           | Repo kendi tipini tanımlar         |
| `apps/web` → `apps/common`             | Kardeş yasağı (`apps`)             |
| `core` → `platform` / `apps` / …       | Motor yukarı bakmaz                |
| Handler içinde Kysely                  | Sadece repo                        |
| Public route’u auth’lu common’a gömmek | `apps/public` kullan               |
