# env

İndeks: [`core/doc.md`](../doc.md)

**Dosya:** `index.ts`

Doğrulanmış process env. Secret ve bağlantı URL’leri burada; uygulama kararları (TTL preset, surface enable) → [`app.config.ts`](../../app.config.ts).

```ts
import { env } from "@/core/env";
```

---

## Amaç

`@t3-oss/env-core` + Zod. Kod yalnızca burada tanımlı değişkenleri okur; özellik gelmeden env eklenmez.

`SKIP_ENV_VALIDATION` set ise Zod atlanır (CI, codegen, prisma generate).

---

## Değişkenler

| Anahtar                     | Zorunlu | Varsayılan / not                        | Tüketici                              |
| --------------------------- | ------- | --------------------------------------- | ------------------------------------- |
| `NODE_ENV`                  |         | `development` \| `test` \| `production` | genel                                 |
| `PORT`                      |         | `3001`                                  | `index.ts` serve                      |
| `API_BASE_PATH`             |         | `/api` (trim, trailing slash yok)       | `server/buildServer` mount            |
| `DATABASE_URL_LIVE`         | ✓       | pooled live URL                         | türetilmiş `DATABASE_URL`             |
| `DATABASE_URL_TEST`         |         | test ortamında tercih                   | türetilmiş `DATABASE_URL`             |
| `DIRECT_URL_LIVE`           |         | unpooled migrate/seed                   | türetilmiş `DIRECT_URL`               |
| `DIRECT_URL_TEST`           |         | test unpooled                           | türetilmiş `DIRECT_URL`               |
| `REDIS_URL`                 |         | `redis://localhost:6379`                | redis, cache, auth, queue, rate-limit |
| `JWT_SECRET`                |         | min 16; dev default var                 | `core/crypto` HS256                   |
| `ACCESS_TOKEN_TTL_SECONDS`  |         | `900`                                   | access JWT + `expires_in`             |
| `REFRESH_TOKEN_TTL_SECONDS` |         | 30 gün                                  | session Redis PX                      |
| `S3_ENDPOINT`               |         | optional                                | `core/files`                          |
| `S3_ACCESS_KEY_ID`          |         | optional                                | `core/files`                          |
| `S3_SECRET_ACCESS_KEY`      |         | optional                                | `core/files`                          |
| `S3_BUCKET_NAME`            |         | optional                                | `core/files`                          |
| `S3_URL`                    |         | public object base URL                  | `buildFileUrl`                        |
| `WEB_BASE_URL`              | ✓       | FE taban URL (mail linkleri)            | `platform/notifications`              |

---

## Türetilmiş alanlar

| Alan               | Mantık                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `env.DATABASE_URL` | `NODE_ENV === "test"` → `DATABASE_URL_TEST ?? DATABASE_URL_LIVE`; aksi live                                                        |
| `env.DIRECT_URL`   | test: `DIRECT_URL_TEST ?? DATABASE_URL_TEST ?? DIRECT_URL_LIVE ?? DATABASE_URL_LIVE`; live: `DIRECT_URL_LIVE ?? DATABASE_URL_LIVE` |

Uygulama runtime pooled `DATABASE_URL` kullanır; Prisma CLI migrate `DIRECT_URL` bekler.

---

## Kurallar

- Secret `.env` / deployment secret store’da; repoya commit edilmez.
- Karar sabitleri (`app_config.cache.enabled`, rate limit preset) env değil — git’te kalır.
- Yeni env → önce bu dosyada Zod tanımı, sonra tüketici kod.

---

## Tüketiciler

`core/database`, `core/redis`, `core/crypto`, `core/files`, `core/http`, `platform/auth`, `platform/notifications`, `server/`, `index.ts`, `middlewares/rate-limit` (dev bypass), `tests/`.
