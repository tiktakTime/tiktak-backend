# query-keys

İndeks: [`core/doc.md`](../doc.md) · Yayın: [`cache/doc.md`](../cache/doc.md)

**Dosyalar:** `types.ts`, `react-query.ts`, `unity.ts`, `index.ts`  
Barrel: `@/core/query-keys`

Backend’in socket ile FE’ye gönderdiği **invalidate query key** üretim stratejileri. Redis cache key’i üretmez.

---

## Amaç

Yazma sonrası FE cache’ini düşürmek için route + path/query param → istemci stratejisine uygun key.

Boot: `configureCache({ invalidate_key_type: "react-query" | "unity" })`.

---

## `invalidateKey(route, params?, type?)`

| Arg      | Anlam                                                           |
| -------- | --------------------------------------------------------------- |
| `route`  | `{ method, path }`                                              |
| `params` | Path param’lar + opsiyonel `query`                              |
| `type`   | `"react-query"` (default) \| `"unity"` \| `null` → `null` döner |

Bilinmeyen type → `null`.

---

## Stratejiler

### react-query

Path → PascalCase operation adı:

`GET /employees/{id}/search` → `"GetEmployeesByIdSearch"`

Dönüş:

- params yok: `["GetEmployeesByIdSearch"]`
- params var: `["GetEmployeesByIdSearch", { path?, query? }]`

### unity

Tek elemanlı dizi:

```ts
[
  {
    operationId: "GetEmployeesByIdSearch",
    route: "/employees/{id}/search",
    method: "GET",
    params: { id: "…" },
    query: { page: "1" },
  },
];
```

---

## Tipler

| Tip                   | Rol                                |
| --------------------- | ---------------------------------- |
| `InvalidateKeyType`   | `"react-query" \| "unity" \| null` |
| `InvalidateParams<R>` | Path + query inference             |
| `QueryKeyStrategy`    | `{ type, generateKey }`            |

---

## Public API

`invalidateKey`, `reactQueryKeyStrategy`, `unityKeyStrategy`, `routeToQueryKey`, `routeToUnityOperationId`, tipler.

---

## Tüketiciler

| Kim                      | Ne                    |
| ------------------------ | --------------------- |
| `cache` `invalidateKeys` | FE key üret           |
| `server` / config        | `invalidate_key_type` |
