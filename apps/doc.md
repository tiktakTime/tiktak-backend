# Apps

HTTP yüzey + domain (use-case) katmanı.

Genel: [`docs/architecture.md`](../docs/architecture.md) · veri: [`modules/doc.md`](../modules/doc.md) · motor: [`core/doc.md`](../core/doc.md)

---

## Kurallar (özet)

| Kural             | Anlam                                                 |
| ----------------- | ----------------------------------------------------- |
| Slice             | `.schema.ts` + `.routes.ts` + `domain/`               |
| Domain            | Çok tablolu iş / invariant burada; repo çağırır       |
| Kardeş import yok | `apps/web` ↛ `apps/common` / `public` / `auth` …      |
| Mount             | `server/` — surfaces döngüsü + ayrı `auth` / `system` |

Aynı yüzey **içinde** relative import serbest (`apps/web/index` → `./person/...`).

---

## Yüzey listesi

| Yüzey                     | Auth    | `app_config.surfaces` | Durum                       | Belge                     |
| ------------------------- | ------- | --------------------- | --------------------------- | ------------------------- |
| [public](./public/doc.md) | Yok     | ✅ enabled            | Invite token/accept         | [doc.md](./public/doc.md) |
| [common](./common/doc.md) | Zorunlu | ✅ enabled            | user, organization          | [doc.md](./common/doc.md) |
| [web](./web/doc.md)       | Zorunlu | ✅ enabled            | Org yönetim slice’ları      | [doc.md](./web/doc.md)    |
| [mobile](./mobile/doc.md) | (plan)  | ❌ disabled           | Stub                        | [doc.md](./mobile/doc.md) |
| [admin](./admin/doc.md)   | (plan)  | ❌ disabled           | Stub                        | [doc.md](./admin/doc.md)  |
| [auth](./auth/doc.md)     | Melez   | Surfaces **dışı**     | Sign-in, token, email flows | [doc.md](./auth/doc.md)   |
| [system](./system/doc.md) | Yok     | Surfaces **dışı**     | health / ready              | [doc.md](./system/doc.md) |

---

## Slice anatomisi

```
apps/<surface>/<slice>/
  <slice>.schema.ts    # Zod / OpenAPI
  <slice>.routes.ts    # defineRoute + createSlice
  domain/
    *.ts
    index.ts
    doc.md             # fonksiyon adımları (spec)
  doc.md               # slice özeti + endpoint listesi
```

`auth` ve `system` slice klasörü kullanmaz (`auth/domain/doc.md` yine var).

**Okuma sırası:** slice `doc.md` (endpoint + schema + HTTP code) → `domain/doc.md` (adımlar) → kod.

| Belge türü         | Derinlik                                                  |
| ------------------ | --------------------------------------------------------- |
| Slice `doc.md`     | Guard, HTTP status, response `code`, schema özeti         |
| `domain/doc.md`    | Fonksiyon adımları — **spec**; değişince kod da değişmeli |
| `modules/*/doc.md` | Alan + repo yüzeyi                                        |
| `core/*/doc.md`    | Motor API + akış                                          |

---

## Mount sırası (`server/buildServer`)

1. `rate_limit.standard` (global)
2. `healthRouter` (`system`)
3. `authRouter` (`auth`)
4. `app_config.surfaces` — enabled olanlar (`public`, `common`, `web`, …)
5. OpenAPI / Scalar

Path prefix şimdilik `/` (`API_BASE_PATH` altında, örn. `/api`).

---

## Slice + domain belgeleri

| Slice           | Yüzey  | Özet                                   | Domain (adımlar)                                     |
| --------------- | ------ | -------------------------------------- | ---------------------------------------------------- |
| auth            | —      | [doc.md](./auth/doc.md)                | [domain/doc.md](./auth/domain/doc.md)                |
| user            | common | [doc.md](./common/user/doc.md)         | [domain/doc.md](./common/user/domain/doc.md)         |
| organization    | common | [doc.md](./common/organization/doc.md) | [domain/doc.md](./common/organization/domain/doc.md) |
| invite (public) | public | [doc.md](./public/invite/doc.md)       | [domain/doc.md](./public/invite/domain/doc.md)       |
| access          | web    | [doc.md](./web/access/doc.md)          | [domain/doc.md](./web/access/domain/doc.md)          |
| employee        | web    | [doc.md](./web/employee/doc.md)        | [domain/doc.md](./web/employee/domain/doc.md)        |
| invite (web)    | web    | [doc.md](./web/invite/doc.md)          | [domain/doc.md](./web/invite/domain/doc.md)          |
| permission      | web    | [doc.md](./web/permission/doc.md)      | [domain/doc.md](./web/permission/domain/doc.md)      |
| person          | web    | [doc.md](./web/person/doc.md)          | [domain/doc.md](./web/person/domain/doc.md)          |
| role            | web    | [doc.md](./web/role/doc.md)            | [domain/doc.md](./web/role/domain/doc.md)            |
