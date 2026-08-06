# API Development Standards

This document defines the architectural standards for creating database queries, repositories, Zod validation schemas, OpenAPI contracts, Hono route handlers, and caching.

---

## 1. Feature-First Domain Structure (`packages/domains`)

Every domain slice (e.g., `organization/core`, `user`) lives in `packages/domains/src/<domain>/<slice>/` and contains 4 co-located files:

- **`<slice>.types.ts`**: Zod validation schemas & TypeScript DTO types.
- **`<slice>.contract.ts`**: OpenAPI endpoint declarations created with `createStandardRoute`.
- **`<slice>.repo.ts`**: Kysely query repository class (e.g., `OrganizationRepository`).
- **`<slice>.routes.ts`**: Hono route handlers created with `createEndpoint`.

### `types.ts` Example

Always derive DTO schemas from `@tiktak/database` models:

```typescript
import z from "zod";
import { UserSchema } from "@tiktak/database";

export const UpdateUserSchema = UserSchema.pick({
  name: true,
  avatar: true,
}).partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
```

### `repo.ts` Example

```typescript
import type { Database } from "../../types";

export class UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string) {
    return this.db
      .selectFrom("User")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }
}
```

---

## 2. Kysely & Structured Data

Use `jsonObjectFrom` and `jsonArrayFrom` for fetching nested related records cleanly without manual flat mapping:

```typescript
import { jsonObjectFrom } from "kysely/helpers/postgres";

.select((eb) => [
  "id",
  jsonObjectFrom(
    eb.selectFrom("Organization")
      .select(["name", "slug"])
      .whereRef("Organization.id", "=", "OrganizationInvitation.organizationId")
  ).as("organization")
])
```

---

## 3. Error Handling (`AppError`)

Always use `AppError` with a standard error code. Never return ad-hoc error JSON objects:

```typescript
import { AppError } from "@tiktak/core";

if (!data) {
  throw new AppError("ENTITY_NOT_FOUND");
}
```

---

## 4. Pagination

Use the centralized `paginate` helper on Kysely queries:

```typescript
import { paginate } from "@tiktak/core";

return paginate(query, params, ["Organization.createdAt"]);
```

---

## 5. Cache Strategy

- Declare `ttl` directly on GET contracts.
- Declare `invalidates` arrays on mutation contracts.
- Use `CacheInvalidator` (`invalidator(c)`) in route handlers for manual invalidations.
