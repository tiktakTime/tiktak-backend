# http

İndeks: [`core/doc.md`](../doc.md) · Hatalar: [`errors/doc.md`](../errors/doc.md) · Sözleşme: [`docs/api-standards.md`](../../docs/api-standards.md)

Barrel: `@/core/http` · İçerik: [`platform/i18n/`](../../platform/i18n/)

HTTP sözleşmesi: route, zarf, locale pazarlığı, tek render hunisi, sayfalama.

## Dosyalar

Route yorumlayıcısı altı sorumluluğa bölünmüş (eski `route.ts`, 564 satır):

| Dosya              | Sorumluluk                                                       |
| ------------------ | ---------------------------------------------------------------- |
| `platform.ts`      | Port wiring: `configureRoutePlatform`, `scopeFor`, id çözücüleri |
| `response-spec.ts` | `Result` / `Page` / `Failure` OpenAPI spec'leri                  |
| `define.ts`        | `RouteDef`, `RouteCtx`, `defineRoute` (tip çıkarımı)             |
| `tags.ts`          | Cache tag kaydı, `qualifyTags`, purge hedefleri                  |
| `compile.ts`       | `RouteDef` → zod-openapi `RouteConfig`, middleware zinciri       |
| `slice.ts`         | Handler sarma (cache read/write/purge), `createSlice`            |

Zarf ve yardımcılar: `result.ts`, `render.ts`, `i18n.ts`, `catalog.ts`,
`error-handler.ts`, `paginate.ts`, `bearer.ts`, `index.ts`.

---

## Public API

| Sembol                                               | Rol                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `configureRoutePlatform`                             | Scope + policy + `hydrateScope` + `resolveTenantId` / `resolveActorId` (boot) |
| `configureI18n`                                      | Bundle + ERROR_META (boot; `@/platform/i18n`)                                 |
| `defineRoute` / `createSlice`                        | Route tanımı; mutation `name` → success.json zorunlu                          |
| `Result` / `Page` / `Failure`                        | OpenAPI yanıt spec                                                            |
| `tenantId` / `actorId`                               | RouteCtx id çözücüleri (ürün isimleri boot’ta)                                |
| `extractBearerToken`                                 | Authorization header                                                          |
| `renderSuccess` / `renderError` / `renderValidation` | Tek huni → wire zarfı                                                         |
| `ok(code, data)`                                     | Domain başarı override                                                        |
| `toPage` / `paginate`                                | Liste zarfı + Kysely                                                          |
| `negotiateLocale` / `interpolate`                    | Accept-Language + `{param}`                                                   |

RouteCtx alanları: `params`, `query`, `body`, `tenantId`, `actorId`, `c`.
