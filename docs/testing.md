# Test stratejisi

İndeks: [`docs/README.md`](./README.md) · Araçlar: [`quality-tools.md`](./quality-tools.md) · Mimari: [`architecture.md`](./architecture.md)

Koşum: `pnpm test` (vitest). Kalite kapısı: `pnpm verify`.

Hedef: domain kararlarının sınırlarını zorlamak, frontend'e gitmeden sorunları ortaya çıkarmak, uygulama bütünlüğünü bozacak durumları yakalamak.

---

## Neden piramit değil

I/O ağırlıklı bir API'de her domain fonksiyonu DB okur, Redis'e yazar, kuyruğa iş atar. Mock'lanan her repo test edilmemiş bir varsayımdır. Ağırlık **entegrasyon katmanında** (Testing Trophy).

---

## Katmanlar

| Katman | Kapsam | Araç | Hız |
| ------ | ------ | ---- | --- |
| 0 — Statik | Tip, lint, mimari, ölü kod | `tsc`, eslint, depcruise, knip | saniye |
| 1 — Saf birim | I/O'suz fonksiyonlar + domain karar ağaçları | vitest | ms |
| 2 — Domain | Karar mantığı, repo `vi.mock` ile | vitest | ms |
| 3 — Entegrasyon | `buildServer()` + gerçek Postgres/Redis | vitest + `app.request()` | saniye |
| 4 — Sözleşme | OpenAPI snapshot + fuzzing | vitest + Schemathesis | dakika |

### Katman seçim kuralı

| Soru | Katman |
| ---- | ------ |
| Saf hesap / karar mı? | 1 |
| Birden çok repo'nun sırası / dallanması mı? | 2 |
| Middleware, yetki, cache, zarf, SQL dahil mi? | 3 |
| Frontend sözleşmesi mi? | 4 |

Şüphedeyse **3**. Katman 2'yi yalnızca kombinasyon patlaması varsa kullan.

---

## Local çalıştırma

Tüm testler **geliştirici makinesinde** koşar. OrbStack / Docker Compose yeterli; bulut servisi gerekmez (OAuth hariç — aşağıda).

```bash
pnpm local:up                                          # postgres + redis + minio
# DATABASE_URL_TEST → tiktak-test-v2 (zorunlu; yoksa LIVE'a düşer)
dotenv -e .env.local -- pnpm db:deploy                 # şema (test DB'ye)
pnpm test
```

`core/env`: `NODE_ENV=test` → `DATABASE_URL_TEST` (yoksa `DATABASE_URL_LIVE` fallback). Test helper'ın ilk satırı: test DB adı `-test` içermiyorsa süreci öldür — canlı DB'ye truncate atmamak için.

`vitest.config.ts` zaten `SKIP_ENV_VALIDATION=1` ve `NODE_ENV=test` set eder.

### OrbStack

- Docker API uyumlu; `docker compose` komutları değişmez.
- Testcontainers'a geçilirse socket: `DOCKER_HOST=unix://$HOME/.orbstack/run/docker.sock` (şimdilik kullanılmıyor).

---

## Dış bağımlılıklar

| Bağımlılık | Local karşılığı | Not |
| ---------- | --------------- | --- |
| PostgreSQL | compose `postgres` → `tiktak-test-v2` | ✅ |
| Redis | compose `redis` | ✅ session, cache, rate-limit, BullMQ |
| S3 | compose `minio` | ✅ upload geldiğinde |
| Socket.IO | aynı süreç + `socket.io-client` | ✅ |
| Mail | kuyruk doğrulaması (Redis) | ✅ SMTP gerekmez |
| Push / FCM | — | ⚪ henüz endpoint yok |
| Google / Apple OAuth | `verifyOAuthIdToken` mock | ⚠️ tek gerçek boşluk |

### Mail — iki seviye

Bu repo SMTP göndermez. `sendEmail` → `addMailJob` (BullMQ). Worker ayrı süreçte.

| Seviye | Ne doğrular | Altyapı |
| ------ | ----------- | ------- |
| 1 — kuyruk (zorunlu) | doğru `key` / alıcı / link kuyruğa düştü mü | Redis |
| 2 — uçtan uca (opsiyonel) | şablon + SMTP | Mailpit + test worker |

Seviye 1, backend'in sahip olduğu sınırı test eder. Mailpit yalnızca **manuel geliştirme konforu** için compose'a eklenebilir (zorunlu değil). Gerçek worker bu repoya girerse Seviye 2 anlamlı olur.

### Mobile

| Anlam | Durum |
| ----- | ----- |
| `apps/mobile` yüzeyi | Boş router; `surfaces.mobile` disabled — test edilecek route yok |
| Mail `platform` param | `resolvePlatform` — saf fonksiyon, katman 1 |
| Push (`user_device`) | Şema + repo hazır; auth route yok. Gelince kuyruk sınırında test |

Mobil istemcinin kendisi backend testinin konusu değil; HTTP sözleşmesi OpenAPI + entegrasyon ile kapsanır.

### OAuth

`verifyOAuthIdToken` uzak JWKS (`googleapis` / `appleid`) çeker; gerçek `id_token` local üretilemez.

| Seçenek | Nasıl | Ne zaman |
| ------- | ----- | -------- |
| A — sınırda mock | `vi.mock` → `verifyOAuthIdToken`; `resolveOAuthUser` gerçek DB ile | Önerilen — refactor yok |
| B — local JWKS | JWKS URL env'e; test RSA + sahte token | Tam offline gerekirse |

Domain mantığı (`resolveOAuthUser`: identity bul, blocked, inactive→active, email bağla, transaction insert) tamamen local test edilir. jose doğrulaması kütüphane kodudur — mock sınırı burasıdır.

---

## Altyapı

### Veritabanı

`DATABASE_URL_TEST` → `tiktak-test-v2` (`scripts/local/postgres-init`).

### İzolasyon: truncate

Transaction rollback **kullanılmıyor** — `apps/public/invite/domain/flows.ts` ve `apps/auth/domain/oauth.ts` kendi içinde `db.transaction()` + `forUpdate()` çalıştırıyor; dıştan sarmak bu akışları bozar.

Her testten önce ilgili tablolar `TRUNCATE … RESTART IDENTITY CASCADE`. Redis test DB: `FLUSHDB` (ayrı Redis DB index veya test-only instance).

### Yardımcılar (`tests/` klasörü)

| Helper | Görev |
| ------ | ----- |
| `assertTestDatabase()` | URL `-test` içermiyorsa process exit |
| `resetDb()` | Truncate + Redis flush |
| `makeOrganization` / `makePerson` / `makeUser` / `makeAccess` | Veri fabrikaları — test sadece önemsediği alanı override eder |
| `signInAs(user)` | Gerçek `createSession` → `Bearer` token |
| `request(app, path, { token })` | `app.request` sarmalayıcısı, zarf parse |

Fabrika kuralı: zorunlu alanlar varsayılan, benzersiz alanlar `randomUUID()`. Şemaya alan eklendiğinde tek yer değişir.

### Test dosyası yeri

| Katman | Konum |
| ------ | ----- |
| 1 / 2 | Kodun yanında — `create.test.ts` |
| 3 | `apps/<yüzey>/<slice>/*.integration.test.ts` |
| Bütünlük | `tests/integrity/*.test.ts` |

Testler barrel'dan import etmez ([`quality-tools.md`](./quality-tools.md) barrel politikası).

---

## Zorunlu test kategorileri

Yeni bir slice eklendiğinde bunlar yazılmadan PR açılmaz.

### 1. Mutlu yol

Her endpoint için en az bir 200.

### 2. Yetki matrisi

Her endpoint × aktör → beklenen status.

| Aktör | Beklenen |
| ----- | -------- |
| anonim | 401 |
| üye, yetkisiz | 403 |
| **başka org üyesi** | 403 / 404 |
| yetkili üye | 200 |
| süper admin | 200 |

Üçüncü satır en kritiği: çok kiracılı sistemde en pahalı hata sınıfı veri sızıntısıdır.

### 3. Domain sınırları

Her `AppError` dalı için bir test. Testin adı kuralı yazar: `"aynı person için aktif employee varsa EMPLOYEE_ALREADY_EXISTS"`.

Hata testinde **yan etkinin oluşmadığı** da doğrulanır (`expect(repo.insert).not.toHaveBeenCalled()`).

### 4. Sınır değerleri

`<=` / `<` kararları, boş liste, `page=0`, `limit` üst sınırı, `null` vs `undefined` ayrımı.

### 5. Eşzamanlılık

`Promise.all` ile iki eşzamanlı çağrı. Zorunlu olduğu yerler:

| Akış | Beklenen |
| ---- | -------- |
| Davet kabul (aynı token) | Biri 200, diğeri `INVITE_ALREADY_ACCEPTED`; tek access satırı |
| `employee_no` tahsisi | İki farklı numara |
| Refresh rotate (aynı token) | Biri başarılı, diğeri reddedilir |

### 6. Cache tutarlılığı

Mutation sonrası ilgili GET bayat dönmemeli. `schedulePurge` fire-and-forget olduğu için testte purge'ün tamamlanması beklenir.

---

## Bütünlük testleri (`tests/integrity/`)

Slice'tan bağımsız, kod tabanı hakkında iddialar. Her biri 5–10 satır, kalıcı koruma.

| İddia | Kırılırsa |
| ----- | --------- |
| `AppError` kodları ⊆ `ERROR_META` | Yanlış HTTP status |
| `ERROR_META` anahtarları = `en`/`tr`/`de` errors.json | Frontend metni çözemez |
| Mutation route `name` ⊆ success.json | Zarf kodu eksik |
| Route path'leri snake_case sözleşmesi | Tutarsız API |
| `cache.read.tags` ↔ bir `cache.write.purge` eşleşmesi | **Bayat cache** |
| Her route'un `tenant` değeri kayıtlı scope | Boot'ta throw |

---

## Sözleşme

### OpenAPI snapshot

`buildServer()` → `/openapi.json` → `toMatchSnapshot()`. Kasıtlı değişiklikte `vitest -u`; diff PR'da incelenir.

### Fuzzing (CI, opsiyonel adım)

```bash
uvx schemathesis run $BASE/openapi.json --phases=examples,coverage,fuzzing,stateful
```

Şemadan otomatik üretilen sınır/geçersiz girdiler ve `create → get → delete` zincirleri. Test yazma maliyeti sıfır.

---

## Sonuçları yorumlama

| Metrik | Ne söyler | Ne söylemez |
| ------ | --------- | ----------- |
| Yeşil/kırmızı | Bilinen kurallar korunuyor | Kural doğru mu |
| Coverage | Hangi satır **çalıştı** | Hangi satır **doğrulandı** |
| Mutation score | Testler gerçekten hata yakalıyor mu | — |
| Süre | Katman dengesi bozulmuş mu | — |

Coverage hedef değil teşhis aracıdır. `%100 coverage + %0 mutation score` mümkündür.

Mutation testing (Stryker) yalnızca `apps/auth/domain` ve `apps/public/invite/domain` üzerinde, manuel/haftalık.

---

## Kurallar

- Her üretim hatası için **önce** kırmızı test, sonra düzeltme.
- Testler birbirine bağlanmaz; herhangi bir sırada çalışır.
- Kütüphane test edilmez (Kysely'nin SQL'i değil, `findById`'in silinmişi döndürmemesi).
- Private fonksiyona `as any` ile sızılmaz — ya export edilir ya public API üzerinden test edilir.
- Mock yalnızca katman 2'de ve yalnızca repo sınırında (OAuth doğrulama sınırı hariç).
- Sahip olunmayan sınır test edilmez (SMTP, FCM, jose JWT doğrulaması).

---

## Yol haritası

| Aşama | İş | Durum |
| ----- | -- | ----- |
| 1 | Altyapı: `assertTestDatabase`, `resetDb`, fabrikalar, `signInAs` | ⬜ |
| 2 | Bütünlük testleri | ⬜ |
| 3 | OpenAPI snapshot | ⬜ |
| 4 | `apps/auth` uçtan uca | ⬜ |
| 5 | Yetki matrisi | ⬜ |
| 6 | Davet akışı + race | ⬜ |
| 7 | Kalan slice'lar | ⬜ |
| 8 | Schemathesis CI | ⬜ |
| 9 | Property-based + mutation | ⬜ |

---

## Bilinen riskler (test yazılınca doğrulanacak)

| # | Risk | Konum |
| - | ---- | ----- |
| 1 | `hydrateScope` cache prefix'ini query/body'den alıyor — prefix kirlenmesi | `platform/scope/resolve.ts` |
| 2 | Davet kabul yarışı — `forUpdate()` doğrulanmamış | `apps/public/invite/domain/flows.ts` |
| 3 | `revokeOrganizationSessions` sessiz başarısızlık (catch + devam) | `platform/auth/revoke-organization.ts` |
| 4 | Eşzamanlı refresh meşru oturumu düşürebilir | `platform/auth/session.ts` |
| 5 | `purge` yazılmamış mutation'lar → bayat cache | `apps/**/*.routes.ts` |
| 6 | `employee_no` tahsis yarışı | `apps/web/employee/domain/employee-no.ts` |
