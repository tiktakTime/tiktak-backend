# Dokümantasyon

## Başlangıç

| Dosya                                      | İçerik                                              |
| ------------------------------------------ | --------------------------------------------------- |
| [getting-started.md](./getting-started.md) | Kurulum, env, script’ler                            |
| [architecture.md](./architecture.md)       | Ana mimari — kök yapı, bağımlılık                   |
| [layers.md](./layers.md)                   | Katman detayı, anti-pattern                         |
| [decisions.md](./decisions.md)             | Ürün / teknoloji kararları                          |
| [inceleme-sirasi.md](./inceleme-sirasi.md) | Kod inceleme yolu                                   |
| [quality-tools.md](./quality-tools.md)     | ESLint / depcruise / knip / vitest / `pnpm verify`  |

## Geliştirme

| Dosya                                  | İçerik                                      |
| -------------------------------------- | ------------------------------------------- |
| [api-standards.md](./api-standards.md) | Slice, `defineRoute`, zarf, cache, OpenAPI  |
| [database.md](./database.md)           | Prisma + Kysely                             |

## Aktif plan

| Dosya                                  | İçerik                                                         |
| -------------------------------------- | -------------------------------------------------------------- |
| [auth-identity.md](./auth-identity.md) | User slim + profile + identity; OAuth (**migrate PENDING**)    |

## Katman indeksleri (`doc.md`)

| Dosya                                          | İçerik                              |
| ---------------------------------------------- | ----------------------------------- |
| [../apps/doc.md](../apps/doc.md)               | Yüzeyler + slice belgeleri          |
| [../modules/doc.md](../modules/doc.md)         | Modül listesi + alan belgeleri      |
| [../core/doc.md](../core/doc.md)               | Motor paketleri                     |
| [../platform/doc.md](../platform/doc.md)       | auth · scope · notifications · i18n |
| [../middlewares/doc.md](../middlewares/doc.md) | auth / permission / rate-limit      |
| [../server/doc.md](../server/doc.md)           | `buildServer` + OpenAPI             |
| [../scripts/doc.md](../scripts/doc.md)         | e2e / cache-socket / postgres-init  |
