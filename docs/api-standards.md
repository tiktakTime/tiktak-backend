# API Development Standards

Hono handler, OpenAPI contract, Kysely repo, Zod validation ve cache.

Mimari: [architecture.md](./architecture.md) · Katman: [layers.md](./layers.md) · Motor: [`core/http/doc.md`](../core/http/doc.md)

---

## 1. Dosya yerleşimi

| Ne                           | Nerede                                           |
| ---------------------------- | ------------------------------------------------ |
| Routes + yüzey şema + domain | `apps/{public,common,web,mobile,admin}/<slice>/` |
| HTTP sözleşme Zod            | `core/fields`, `core/http`                       |
| Kysely repo                  | `modules/<entity>/*.repo.ts`                     |
| Request guard                | `middlewares/` + route `policy` / `tenant`       |
| App / route / errors         | `core/router`, `core/http`, `core/errors`        |
| Ürün i18n / bildirim         | `platform/i18n`, `platform/notifications`        |

### Yüzey slice

- **`<slice>.schema.ts`** — endpoint Zod
- **`<slice>.routes.ts`** — `defineRoute` + `createSlice`
- **`domain/`** — use-case (handler → domain → repo)

### Modül

- **`<entity>.repo.ts`** — tek Kysely yazma noktası; apps şema tipi **import edilmez**
- **`domain/` yok**
- Kardeş modül import **serbest**

### Kardeş import

`apps/X` ↛ `apps/Y`. `core` içi serbest (döngü yok). `modules` / `platform` serbest. Ayrıntı: [architecture.md](./architecture.md).

---

## 2. Katman kuralları

| Kural                         | Açıklama                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| Handler → domain → repo       | Route handler doğrudan Kysely yazmaz                        |
| Use-case kuralı → apps domain | Akışlar `apps/*/domain`                                     |
| Repo tipi → modules           | apps şema tipi import edilmez                               |
| Kardeş import                 | `apps/web`↛`apps/*`. `core` içi OK (ADP). `modules` serbest |
| DB row ≠ API DTO              | Validation elle; Prisma Zod generate yok                    |
| Parse sınırı                  | Handler öncesi OpenAPI / Zod middleware                     |

---

## 3. Route = veri; motor yorumlar

Routes ve domain yalnızca kuralları taşır; mekanikler `core/http` içinde tek yerden yorumlanır.

```ts
const search = defineRoute({
  name: "employee.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  request: { query: EmployeeSearchQuerySchema },
  response: Page(EmployeeSchema),
  tenant: "org",
  policy: ["employee.get"],
  cache: { read: { ttl: TTL.DEFAULT, tags: ["employee"] } },
  handle: ({ tenantId, query }) => searchEmployees(tenantId, query),
});

const create = defineRoute({
  name: "employee.create",
  method: "post",
  path: BASE,
  tag: TAG,
  request: { body: EmployeeCreateSchema },
  response: Result(EmployeeSchema),
  tenant: "org",
  policy: ["employee.post"],
  cache: { write: { purge: ["employee", "employee_no"] } },
  handle: ({ tenantId, body }) => createEmployee(tenantId, body),
});

export const employeeRouter = createSlice([search, create]);
```

| Alan        | Anlam                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| `name`      | Katalog anahtarı + success mesajı (`platform/i18n/*/success.json`)     |
| `tenant`    | Scope anahtarı (`org` / `member` / `none` / …) — boot’ta resolve       |
| `policy`    | AND permission slug’ları                                               |
| `cache`     | GET `read` (ttl + tags) · mutation `write.purge`                       |
| `handle`    | `RouteCtx`: `params`, `query`, `body`, `tenantId`, `actorId`, `c`      |

Boot: `configureRoutePlatform` + `configureI18n` (`server/`). Dosya bölümü: [`core/http/doc.md`](../core/http/doc.md).

**Henüz yok:** ALS transaction, RLS, discriminated-union girdiler.

---

## 4. Örnekler

### Schema (yüzey)

```typescript
import z from "zod";

export const UpdateUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  picture: z.string().url().optional(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
```

### Repo (modül)

```typescript
import { db } from "@/modules/db";

export async function findUserById(id: string) {
  return db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}
```

---

## 5. Kysely — nested data

```typescript
import { jsonObjectFrom } from "kysely/helpers/postgres";

.select((eb) => [
  "id",
  jsonObjectFrom(
    eb.selectFrom("organization")
      .select(["company_name", "email"])
      .whereRef("organization.id", "=", "person.organization_id"),
  ).as("organization"),
])
```

Tablo adları **snake_case**.

---

## 6. Error handling

```typescript
import { AppError } from "@/core/errors";

if (!row) {
  throw new AppError("USER_NOT_FOUND");
}

throw new AppError("EMPLOYEE_NO_IN_USE", { no: 42 });
```

Katalog anahtarı + opsiyonel `{param}` interpolasyonu. HTTP status / meta:
`platform/i18n/catalog.meta.ts`. Mesajlar: `Accept-Language` → EN/TR/DE.

---

## 7. Pagination + response

Liste:

```typescript
import { paginate } from "@/core/http";

return paginate(query, params, ["created_at"]);
// → { data, empty, pagination: { total, page } }
```

İşlem zarfı (platform `renderSuccess`; domain düz veri veya `ok(...)` döner):

```typescript
import { ok } from "@/core/http";

return row;
// → { status, code: route.name, title, message, data }

return ok("access.already-existed", existing);
```

Yanıt başlıkları: `Content-Language`, `X-Trace-Id`.

---

## 8. Cache

- GET contract’ta `cache.read` (`ttl`, `tags`)
- Mutation contract’ta `cache.write.purge`
- Tag’ler scope ile nitelenir (`platform/scope`)

---

## Import notu

`@/*` → repo kökü. Örnek: `@/core/errors`, `@/modules/db`, `@/platform/auth`, `@/middlewares`.
Core/platform dışarıdan **yalnızca barrel** (`@/core/http`, `@/platform/auth`) — [quality-tools.md](./quality-tools.md).
