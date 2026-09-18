# Platform

Motoru (`core/`) TikTak’a bağlayan sağlayıcı katman. Port doldurma + ürün
sözleşmeleri; vendor SDK sarmalayıcısı değildir.

| Klasör                            | Rol                                                                      | Doc |
| --------------------------------- | ------------------------------------------------------------------------ | --- |
| [auth](./auth/)                   | Claims, session CRUD, JWT+Redis verify, org-revoke, context augmentation | [doc](./auth/doc.md) |
| [scope](./scope/)                 | Org/member anahtarları, hydrate, cache prefix, socket odası              | [doc](./scope/doc.md) |
| [notifications](./notifications/) | MailJob sözleşmesi, şablon anahtarları, FE link üretimi                  | [doc](./notifications/doc.md) |
| [i18n](./i18n/)                   | EN/TR/DE bundles + `catalog.meta`                                        | [doc](./i18n/doc.md) |

## Bağımlılık

```
platform/* → core/
platform/X → platform/Y   ✅
platform ↛ apps / modules
```

Boot wiring (`configureI18n`, `configureRoutePlatform`, socket `authenticate`)
→ `server/` + kök `index.ts`.

## Ne burada, ne değil

| Burada                                         | Değil (başka katman)                          |
| ---------------------------------------------- | --------------------------------------------- |
| Session / JWT / Redis key düzeni               | Şifre doğrulama, sign-up kuralları (`apps/auth`) |
| Tenant id hydrate + socket oda yetkisi         | `assertPermission` (`middlewares`)            |
| MailJob şekli + FE link + enqueue              | BullMQ worker (bu repoda yok)                 |
| Hata/success katalog metinleri + HTTP status   | Zarf render (`core/http`)                     |
