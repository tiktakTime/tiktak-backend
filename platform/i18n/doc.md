# i18n

İndeks: [`platform/doc.md`](../doc.md) · Render: [`core/http/doc.md`](../../core/http/doc.md)

Ürün katalog **içeriği** (EN/TR/DE). Mekanizma (`negotiateLocale`, `renderError`,
`interpolate`) → `@/core/http`. Bu paket yalnızca metin + HTTP status meta taşır.

Barrel: `@/platform/i18n`

| Dosya / klasör      | Rol                                              |
| ------------------- | ------------------------------------------------ |
| `index.ts`          | `bundles`, tip augmentation, dil eşliği assert   |
| `catalog.meta.ts`   | `ERROR_META` — status (+ severity opsiyonel tip) |
| `en\|tr\|de/*.json` | `errors` / `success` / `validation` metinleri    |

---

## Bundle şekli

Her locale:

```ts
{
  errors: Record<ErrorKey, { title; message }>;
  success: Record<SuccessKey, { title; message }>;
  validation: Record<ValidationKey, { message }>;
}
```

`ErrorKey` / `SuccessKey` / `ValidationKey` **EN JSON anahtarlarından** türetilir.
TR/DE ataması `Record<ErrorKey, …>` ile derleme zamanı eksik anahtar yakalar
(`_trErrors` vb. void assert).

Desteklenen locale: `en` | `tr` | `de` (`SupportedLocale`).

---

## `ERROR_META`

Locale-bağımsız. Her `ErrorKey` → `{ status: number }` (`ErrorMeta`).

Örnekler: `UNAUTHORIZED` 401, `VALIDATION_ERROR` 422, `TOO_MANY_REQUESTS` 429,
`ACCESS_ALREADY_EXISTS` 409.

Wire’da sunucu **çevrilmiş metin göndermez** (ürün kuralı); istemci `code` ile
kendi kataloğundan çözer. Meta yine de status + OpenAPI Failure başlıkları için
boot’ta `configureI18n({ errorMeta })` ile verilir.

---

## Catalog tip augmentation

`index.ts`:

```ts
declare module "@/core/http/catalog" {
  interface CatalogRegistry {
    error: keyof typeof enErrors;
    success: keyof typeof enSuccess;
  }
}
```

Böylece `AppError("USER_NOT_FOUND")` / `ok("organization.delete", data)` tip
güvenli kalır — bilinmeyen kod derleme hatası.

Mutation route `name` (GET dışı) → success kataloğunda zorunlu
(`registerMutationSuccessKey` / `createSlice`).

---

## Boot

`server/buildServer`:

```ts
configureI18n({
  bundles,
  defaultLocale: "en",
  errorMeta: ERROR_META,
});
```

İstek anında: Accept-Language → locale → `renderSuccess` / `renderError` hunisi
(`core/http`).

---

## Yeni kod ekleme checklist

1. `en/errors.json` (veya success/validation) anahtar + title/message
2. Aynı anahtar `tr/` ve `de/`
3. Hata ise `catalog.meta.ts` → `ERROR_META` status
4. `tsc` — eksik dil / meta derlemede patlar

---

## Bağımlılık

```
platform/i18n → core/http (ErrorMeta tipi, catalog augmentation)
server → configureI18n(bundles, ERROR_META)
apps ↛ platform/i18n doğrudan (genelde AppError code yeter)
```
