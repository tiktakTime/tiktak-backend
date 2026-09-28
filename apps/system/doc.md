# system

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `health.ts` (`healthRouter`)  
**Mount:** surfaces **dışı** — `server` doğrudan mount (auth ile birlikte erken sıra)  
**Auth:** yok

---

## Amaç

İşlem ve bağımlılık sağlık kontrolleri (liveness / readiness). Load balancer ve orchestrator için.

---

## Endpoint'ler

| Method | Path            | Guard | HTTP          | Response                                                                                                              |
| ------ | --------------- | ----- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`       | —     | 200           | `{ status: "ok" }`                                                                                                    |
| GET    | `/health/ready` | —     | 200 / **503** | DB `select 1` başarılı → `{ status: "ok", database: "ok" }`; hata → `{ status: "degraded", database: "unreachable" }` |

---

## Notlar

- **Liveness** (`/health`): DB'ye dokunmaz; process ayakta mı
- **Readiness** (`/health/ready`): Postgres erişimi; başarısızsa **503** (degraded)
- Tek dosya router; slice klasörü yok
