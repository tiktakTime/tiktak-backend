# Platform

Motoru (`core/`) TikTak’a bağlayan sağlayıcı katman. Port doldurma + ürün
sözleşmeleri; vendor SDK sarmalayıcısı değildir.

| Klasör                            | Rol                                                                      |
| --------------------------------- | ------------------------------------------------------------------------ |
| [auth](./auth/)                   | Claims, session CRUD, JWT+Redis verify, org-revoke, context augmentation |
| [scope](./scope/)                 | Org/member anahtarları, hydrate, cache prefix, socket odası              |
| [notifications](./notifications/) | MailJob sözleşmesi, şablon anahtarları, FE link üretimi                  |
| [i18n](./i18n/)                   | EN/TR/DE bundles + `catalog.meta`                                        |

## Bağımlılık

```
platform/* → core/
platform/X → platform/Y   ✅
platform ↛ apps / modules
```

Boot wiring (`configureI18n`, `configureRoutePlatform`, socket `authenticate`)
→ `server/`.
