# queue

BullMQ kuyruk tanımları. **Worker süreci bu repoda yok** — job ekleme API’si.

Barrel: `@/core/queue`

| Queue         | Job             | Payload                                              |
| ------------- | --------------- | ---------------------------------------------------- |
| `mail-queue`  | `send-mail`     | `EnqueueMailJob` (`key`, `mail`, `payload`, `meta?`) |
| `image-queue` | `process-image` | `{ path, reference_id }`                             |

Ürün mail sözleşmesi (`MailJob`, `sendEmail`) → `@/platform/notifications`.

## Public

- `addMailJob` / `addImageJob` / `closeQueues`
- `mailQueue` / `imageQueue`

## Bağımlılık

`@/core/redis` · tüketiciler: `platform/notifications`, `index.ts` shutdown.
