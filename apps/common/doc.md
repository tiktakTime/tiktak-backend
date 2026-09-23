# common

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`commonRouter`)  
**Mount:** `app_config.surfaces.common` — enabled  
**Auth:** `authMiddleware` — tüm uçlar bearer zorunlu

---

## Amaç

Web / mobile / admin için **ortak contract**: global `user` ve `organization` slice'ları. Org-scoped yönetim [`web/doc.md`](../web/doc.md) yüzeyinde.

---

## Slice'lar

| Slice        | Base            | Guard özeti                                                                       | Belge                                        |
| ------------ | --------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| user         | `/user`         | `tenant: "member"`; read: `policy: user.get`                                      | [user/doc.md](./user/doc.md)                 |
| organization | `/organization` | search/create: `member`; get/restore/delete: `orgParam` + `organization.*` policy | [organization/doc.md](./organization/doc.md) |

---

## Endpoint özeti

### user

| Method | Path           | HTTP | code          |
| ------ | -------------- | ---- | ------------- |
| GET    | `/user/search` | 200  | Page          |
| GET    | `/user/{id}`   | 200  | `user.get`    |
| POST   | `/user`        | 200  | `user.create` |
| PATCH  | `/user/{id}`   | 200  | `user.update` |
| DELETE | `/user/{id}`   | 200  | `user.delete` |

### organization

| Method | Path                         | HTTP | code                   |
| ------ | ---------------------------- | ---- | ---------------------- |
| GET    | `/organization/search`       | 200  | Page                   |
| GET    | `/organization/{id}`         | 200  | `organization.get`     |
| POST   | `/organization`              | 200  | `organization.create`  |
| PATCH  | `/organization/{id}/restore` | 200  | `organization.restore` |
| DELETE | `/organization/{id}`         | 200  | `organization.delete`  |

---

## Kurallar

- Guard: route `tenant` + `policy` (`defineRoute`) — middleware boot’ta bağlanır
- Response cache: `RouteDef.cache` + `cachePrefix.user` / org param scope
- Kardeş yüzey import yasak (`apps/web` ↛ `apps/common`)
