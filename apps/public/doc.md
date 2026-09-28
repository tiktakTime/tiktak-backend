# public

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`publicRouter`)  
**Mount:** `app_config.surfaces.public` — enabled, önek `/`  
**Auth:** yok  
**Handle:** bu adımda `NOT_IMPLEMENTED`

Oturum istemeyen uçlar. Davet linki web ve mobil için tek adrestir.

| Yol                    | Limit                                      |
| ---------------------- | ------------------------------------------ |
| `GET /invite/by-token` | `rate_limit.invite` — IP başına 20 / 60s   |
| `POST /invite/accept`  | `rate_limit.invite` — IP başına 20 / 60s   |

Gönderme, yeniden gönderme, arama ve iptal [`common`](../common/doc.md) içindedir.
