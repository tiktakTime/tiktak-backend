# router

İndeks: [`core/doc.md`](../doc.md) · Hatalar: [`errors/doc.md`](../errors/doc.md)

**Dosyalar:** `router.ts`, `types.ts`, `index.ts`  
Barrel: `@/core/router`

Hono OpenAPI uygulama fabrikası ve istek bağlamı (`AppBindings`).

---

## Amaç

- Tip güvenli `OpenAPIHono<AppBindings>`
- Kök app: `trace_id`, `locale`, global error / 404
- Alt router: aynı validation hook (422)

Route kaydı → `@/core/http` (`createSlice` / `openapiRoutes`).

---

## `AppVariables` (core)

| Alan       | Kim yazar              | Anlam                    |
| ---------- | ---------------------- | ------------------------ |
| `trace_id` | `createApp` middleware | `x-request-id` veya UUID |
| `locale`   | i18n middleware        | Accept-Language          |

RBAC / session alanları (`user_id`, `organization_id`, …) →
[`platform/auth/context.d.ts`](../../platform/auth/context.d.ts) augmentation.
`.d.ts` tsconfig `include` ile daima yüklenir; runtime import gerekmez.
