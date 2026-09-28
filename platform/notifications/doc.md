# notifications

İndeks: [`platform/doc.md`](../doc.md) · Kuyruk: [`core/queue/doc.md`](../../core/queue/doc.md)

Ürün bildirim sözleşmesi: mail şablon anahtarı, FE doğrulama linki, BullMQ enqueue.
Worker bu repoda yok — sadece job üretir.

Barrel: `@/platform/notifications`

| Dosya         | Rol                                                        |
| ------------- | ---------------------------------------------------------- |
| `mail-job.ts` | `MailJob` tipi                                             |
| `links.ts`    | `buildVerificationLink`, `resolvePlatform`, `MailPlatform` |
| `send.ts`     | `sendEmail` → `addMailJob`                                 |

---

## `MailJob`

| Alan      | Zorunlu | Anlam                                                |
| --------- | ------- | ---------------------------------------------------- |
| `key`     | ✓       | Şablon anahtarı — örn. `v2:verifyEmail`, `v2:invite` |
| `mail`    | ✓       | Alıcı e-posta                                        |
| `payload` | ✓       | Şablona giden serbest JSON                           |
| `userId`  |         | Queue `meta.userId` olarak yazılır                   |

Çağıran bu tipi doldurur; ham `addMailJob` çağırmaz. Şu an çağıran yok.

---

## `sendEmail(input | input[])`

Her job için:

1. `addMailJob({ key, mail, payload, meta?: { userId } })`
2. `NODE_ENV !== production` → konsola `[mail] key → mail payload` (worker yokken debug)

Hata: queue/Redis hatası yukarı fırlar — çağıran yakalar veya route error handler'a gider.

---

## Link üretimi (`links.ts`)

### `resolvePlatform(input?)`

| Girdi (lowercase)            | Sonuç      |
| ---------------------------- | ---------- |
| `ios` / `android` / `mobile` | `"mobile"` |
| diğer / boş                  | `"web"`    |

### `buildVerificationLink(path, token, platform = "web")`

```
{WEB_BASE_URL}{path}?token=…&platform=…
```

- `WEB_BASE_URL` trailing slash kırpılır; path `/` ile normalize
- Fallback URL **yok** — `WEB_BASE_URL` env zorunlu (`core/env`)

Kullanım: e-posta doğrulama, şifre sıfırlama, invite kabul linkleri.

---

## Tipik akış

```
buildVerificationLink("/…", token, resolvePlatform(…))
  → sendEmail({ key, mail, userId?, payload: { link, … } })
  → mail-queue / send-mail
  → (harici worker şablon render + SMTP)
```

---

## Bağımlılık

```
platform/notifications → core/queue, core/env
core/queue ↛ platform   (ters yön yok)
```
