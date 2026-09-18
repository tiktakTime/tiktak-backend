# i18n

Ürün katalog içeriği (EN/TR/DE). Mekanizma: `@/core/http` (`configureI18n`, render).

Barrel: `@/platform/i18n`

| Dosya             | Rol                                               |
| ----------------- | ------------------------------------------------- |
| `index.ts`        | `bundles`, `ERROR_META`, catalog tip augmentation |
| `catalog.meta.ts` | HTTP status / severity meta                       |
| `en               | tr                                                | de/*.json` | errors / success / validation metinleri |

Boot: `server/index.ts` → `configureI18n({ bundles, errorMeta })`.
