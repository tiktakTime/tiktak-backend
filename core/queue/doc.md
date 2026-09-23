# queue

İndeks: [`core/doc.md`](../doc.md) · Mail ürün: [`platform/notifications/doc.md`](../../platform/notifications/doc.md)

BullMQ **üretici** API’si. **Worker süreci bu repoda yok** — job’lar Redis’e
yazılır; ayrı süreç tüketir.

Barrel: `@/core/queue`

Bağlantı: `getRedis()` → BullMQ `ConnectionOptions` (aynı ioredis instance).

---

## Kuyruklar

| Queue         | Job adı         | Payload                  |
| ------------- | --------------- | ------------------------ |
| `mail-queue`  | `send-mail`     | `EnqueueMailJob`         |
| `image-queue` | `process-image` | `{ path, reference_id }` |

### `EnqueueMailJob`

| Alan      | Anlam                                                      |
| --------- | ---------------------------------------------------------- |
| `key`     | Şablon anahtarı                                            |
| `mail`    | Alıcı                                                      |
| `payload` | Şablon verisi                                              |
| `meta?`   | Örn. `{ userId }` — ürün `MailJob.userId` buraya map’lenir |

---

## Public API

| Fonksiyon                             | Davranış                                        |
| ------------------------------------- | ----------------------------------------------- |
| `addMailJob(data)`                    | `mailQueue.add("send-mail", data)`              |
| `addImageJob({ path, reference_id })` | `imageQueue.add("process-image", …)`            |
| `closeQueues()`                       | Her iki queue `close()` — shutdown (`index.ts`) |
| `mailQueue` / `imageQueue`            | Ham BullMQ Queue (nadiren)                      |

Ürün kodu genelde `platform/notifications.sendEmail` kullanır; `addMailJob`
doğrudan çağrı nadirdir.

---

## Yaşam döngüsü

```
API process                          Worker (harici)
───────────                          ───────────────
sendEmail / addImageJob
  → Redis list (BullMQ)
                                     → job al
                                     → SMTP / sharp / S3
```

Worker yokken: mail job birikir; dev’de `sendEmail` konsola da yazar.

---

## Bağımlılık

```
core/queue → core/redis
platform/notifications → addMailJob
index.ts shutdown → closeQueues
```
