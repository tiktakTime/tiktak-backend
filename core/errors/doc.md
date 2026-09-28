# errors

İndeks: [`core/doc.md`](../doc.md) · Zarf: [`http/doc.md`](../http/doc.md) · i18n: [`platform/i18n/doc.md`](../../platform/i18n/doc.md)

**Dosyalar:** `errors.ts` (yaprak), `index.ts` (handler re-export)  
HTTP adaptörler: [`core/http/error-handler.ts`](../http/error-handler.ts)  
Barrel: `@/core/errors`

---

## `AppError`

```ts
throw new AppError("EMAIL_ALREADY_EXISTS");
```

| Üye      | Anlam                                                       |
| -------- | ----------------------------------------------------------- |
| `key`    | Katalog anahtarı (`ErrorKey`) — tip `i18n` augmentation ile |
| `params` | Opsiyonel `{param}` interpolasyonu                          |

HTTP status **AppError’da yok** — `platform/i18n/catalog.meta.ts` → `renderError`.

Kayıt yoksa açık yazılır:

```ts
if (!row) throw new AppError("USER_NOT_FOUND");
```

### `ERROR_CODES`

OpenAPI standart hata yanıtları + `HTTPException` eşlemesi için 8 base kod.
Fırlatmalar katalog anahtarı kullanır; base kod ikinci argüman değildir.

---

## Handler’lar

`@/core/errors` veya `@/core/http` üzerinden:

| Export            | Davranış                                               |
| ----------------- | ------------------------------------------------------ |
| `validationHook`  | Zod → `ValidationKey` + i18n → 422 `errors[]`          |
| `errorHandler`    | `AppError` / `HTTPException` / unknown → `renderError` |
| `notFoundHandler` | `NOT_FOUND`                                            |

---

## Import

| Ne                                  | Nereden                |
| ----------------------------------- | ---------------------- |
| `AppError` / `ERROR_CODES` (yaprak) | `@/core/errors/errors` |
| Aynı + handler’lar                  | `@/core/errors`        |
