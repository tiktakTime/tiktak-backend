# common

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`commonRouter`)  
**Mount:** `app_config.surfaces.common` — enabled, önek `/common`  
**Auth:** `authMiddleware`  
**Handle:** bu adımda `NOT_IMPLEMENTED`

Web ve mobil bu yolları ortak kullanır; kayıt bir kez burada durur.

---

## Slice'lar

| Slice        | Yollar                                                                        |
| ------------ | ----------------------------------------------------------------------------- |
| access       | `GET /organization/access/search`, `PATCH /organization/access/upsert-access` |
| address      | `/address` — `POST`, `GET search`, `GET/PATCH/DELETE {id}`                    |
| bank-account | `/bank-account` — `POST`, `GET search`, `GET/PATCH/DELETE {id}`               |
| country      | `/country` — `GET search`, `GET/PATCH/DELETE {id}`                            |
| file         | `/files` — `GET`, `POST`, `GET/PATCH/DELETE {id}`                             |
| invite       | `POST /organization/invite`, `POST {id}/resend`, `GET search`, `PATCH {id}/cancel` |
| social-media | `/social-media` — `POST`, `GET search`, `GET/PATCH/DELETE {id}`               |

Kardeş yüzey import yasak (`apps/web` ↛ `apps/common`).
