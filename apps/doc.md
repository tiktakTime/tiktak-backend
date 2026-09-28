# Apps

HTTP yüzeyleri. Route'lar `defineRoute` + `createSlice` ile yazılır. Handle'lar şu an `NOT_IMPLEMENTED` fırlatır.

Genel: [`docs/architecture.md`](../docs/architecture.md) · şema: [`modules/doc.md`](../modules/doc.md) · motor: [`core/doc.md`](../core/doc.md)

---

## Kurallar

| Kural             | Anlam                                                 |
| ----------------- | ----------------------------------------------------- |
| Slice             | `apps/<yüzey>/<slice>/<slice>.routes.ts`              |
| Kardeş import yok | `apps/web` ↛ `apps/common` / `public` / `auth` …      |
| Mount             | `server/` — surfaces döngüsü + ayrı `auth` / `system` |

Aynı yüzey **içinde** relative import serbest.

---

## Yüzey listesi

| Yüzey                     | Auth    | `app_config.surfaces` | İçerik                                                     |
| ------------------------- | ------- | --------------------- | ---------------------------------------------------------- |
| [public](./public/doc.md) | Yok     | ✅ enabled, `/`       | Davet linki: `GET /invite/by-token`, `POST /invite/accept` |
| [common](./common/doc.md) | Zorunlu | ✅ enabled, `/common` | access, address, bank-account, country, file, invite, social-media |
| [web](./web/doc.md)       | Zorunlu | ✅ enabled, `/web`    | Web istemcisinin yolları                                   |
| [mobile](./mobile/doc.md) | Zorunlu | ✅ enabled, `/mobile` | Mobil istemcinin yolları                                   |
| [admin](./admin/doc.md)   | Zorunlu | ✅ enabled, `/admin`  | Süperadmin yolları                                         |
| [auth](./auth/doc.md)     | Melez   | Surfaces **dışı**     | Oturum uçları, yol `/auth/...`                             |
| [system](./system/doc.md) | Yok     | Surfaces **dışı**     | health / ready                                             |

---

## Mount sırası (`server/buildServer`)

1. `rate_limit.standard` (global)
2. `healthRouter` (`system`)
3. `authRouter` (`auth`)
4. OpenAPI / Scalar
5. `app_config.surfaces` — enabled olanlar

Gerçek URL: `{API_BASE_PATH}{yüzey öneki}{routePath}`.
