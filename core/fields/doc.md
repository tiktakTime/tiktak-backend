# fields

İndeks: [`core/doc.md`](../doc.md)

**Dosyalar:** `fields.ts`, `index.ts`  
Barrel: `@/core/fields`

Wire üzerinde tekrarlayan Zod parçaları ve e-posta normalizasyonu.

---

## Amaç

Slice şemalarında kopyala-yapıştır UUID / tarih / e-posta kurallarını tek yerde tutmak. Domain doğrulama burada değil.

---

## Şemalar

| Export             | Şekil               | Not                                                          |
| ------------------ | ------------------- | ------------------------------------------------------------ |
| `IdParamSchema`    | `{ id: uuid }`      | Path `/…/{id}`                                               |
| `DateOnlySchema`   | `YYYY-MM-DD` string | `.nullable().optional()`                                     |
| `IsoInstantSchema` | ISO-8601 datetime   | `.nullable().optional()` — `expires_at`, `*_verified_at` vb. |

---

## `normalizeEmail`

```ts
normalizeEmail("  Ali@X.COM "); // "ali@x.com"
normalizeEmail(""); // null
normalizeEmail(null); // null
```

Trim + lowercase; boş → `null`. Auth, invite, user email guard’larında kullanılır.

---

## Tüketiciler

| Kim                              | Ne                            |
| -------------------------------- | ----------------------------- |
| `apps/**/*.schema.ts`            | IdParam, DateOnly, IsoInstant |
| `apps/auth`, invite, user domain | `normalizeEmail`              |
