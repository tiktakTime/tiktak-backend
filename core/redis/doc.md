# redis

İndeks: [`core/doc.md`](../doc.md)

**Dosya:** `index.ts`

Paylaşılan **ioredis** istemcisi. Session, response cache, rate-limit ve BullMQ aynı bağlantıyı kullanır.

Barrel: `@/core/redis`

---

## `getRedis()` — lazy singleton

1. `globalThis.__redis` varsa döner (tsx hot reload güvenli)
2. Yoksa `new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: true })`
3. `error` event → console.error
4. Instance cache’lenir

`maxRetriesPerRequest: null` — BullMQ gereksinimi; blocking komutlar için zorunlu.

---

## `closeRedis()`

1. Singleton var ve `status !== "end"` → `quit()`
2. `globalThis.__redis` silinir

Shutdown sırası: [`index.ts`](../../index.ts) — socket → HTTP → queues → **redis** → db.

---

## Bağımlılıklar

`env.REDIS_URL` ← `@/core/env`

---

## Tüketiciler

| Paket                    | Kullanım                        |
| ------------------------ | ------------------------------- |
| `platform/auth`          | session, refresh, user_sessions |
| `core/cache`             | `RedisCacheStore`               |
| `core/queue`             | BullMQ connection               |
| `middlewares/rate-limit` | Lua INCR script                 |
| `index.ts`               | graceful shutdown               |

Tek client — key namespace prefix’lerle ayrılır (`session:`, `cache:`, `rate-limit:`, BullMQ internal).
