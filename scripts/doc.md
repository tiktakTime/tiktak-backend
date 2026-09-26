# Scripts

Operasyonel / doğrulama script’leri. Kök `package.json` `db:*` / `local:*` ayrı; bu dosyalar elle veya CI’da `node` ile çalıştırılır.

Başlangıç: [`docs/getting-started.md`](../docs/getting-started.md)

---

## Liste

| Dosya                                      | Amaç                                         | Çalıştırma                           |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------ |
| `test-clean.ts`                            | `tiktak-test-v2` tabloları + Redis db 15     | `pnpm db:test:clean`                 |
| `e2e-smoke.mjs`                            | API duman testi (auth + CRUD akışı + socket) | `node scripts/e2e-smoke.mjs`         |
| `test-cache-socket.mjs`                    | Cache hit/miss + socket `invalidate`         | `node scripts/test-cache-socket.mjs` |
| `local/postgres-init/01-create-test-db.sh` | Docker ilk ayağa kalkış — test DB            | Compose volume init (manuel değil)   |

**Not:** `e2e-smoke` ve `test-cache-socket` için npm script yok — doğrudan `node` kullan.

---

## Ortak env

| Değişken                     | Default                          | Kullanım                                |
| ---------------------------- | -------------------------------- | --------------------------------------- |
| `E2E_BASE`                   | `http://localhost:3001/api-test` | HTTP API base (gateway prefix dahil)    |
| `E2E_SOCKET`                 | `http://localhost:3001`          | Socket.IO origin                        |
| `REDIS_URL`                  | `redis://localhost:6379`         | `test-cache-socket` doğrudan Redis okur |
| `E2E_EMAIL` / `E2E_PASSWORD` | test kullanıcı                   | cache-socket auth                       |

Önkoşul: `pnpm dev` ile API ayakta; Redis + Postgres compose ile.

---

## `e2e-smoke.mjs`

Tipik akış:

1. Health / auth sign-in
2. Organization switch
3. Temel kaynak istekleri (user, org, …)
4. Socket bağlantı + event dinleme

PASS/FAIL satır satır konsol; exit code hata sayısına göre.

```bash
node scripts/e2e-smoke.mjs
# E2E_BASE=http://localhost:3001/api node scripts/e2e-smoke.mjs
```

---

## `test-cache-socket.mjs`

Cache + Socket triad (user/org scoped):

1. Auth → access token
2. GET cacheable endpoint — ilk miss, ikinci hit (Redis)
3. Mutation → `invalidateKeys`
4. Socket client `invalidate` event alır
5. Redis key temizliği doğrulanır

```bash
node scripts/test-cache-socket.mjs
```

Gereksinim: çalışan backend + Redis + geçerli test kullanıcı.

---

## `local/postgres-init/01-create-test-db.sh`

Docker Compose postgres container ilk start (boş volume):

```sql
CREATE DATABASE "tiktak-test-v2";
```

Ana DB `POSTGRES_DB` env’den gelir; script test DB ekler. `DATABASE_URL_TEST` bu DB’ye işaret etmeli.

Mount: `docker-compose.yml` → `/docker-entrypoint-initdb.d/`

---

## İlgili npm script’ler (kök)

| Script                                                          | Ne                     |
| --------------------------------------------------------------- | ---------------------- |
| `pnpm local:up` / `down` / `reset`                              | Docker Compose         |
| `pnpm db:generate` / `migrate` / `deploy` / `status` / `studio` | Prisma / Kysely tipler |
| `pnpm dev` / `start` / `check`                                  | Süreç / `tsc --noEmit` |

E2E script’leri için `pnpm dev` + `pnpm local:up` yeterli başlangıç.
