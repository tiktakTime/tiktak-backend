# Test stratejisi

İndeks: [`docs/README.md`](./README.md) · Araçlar: [`quality-tools.md`](./quality-tools.md) · Mimari: [`architecture.md`](./architecture.md) · Sözleşme: [`api-standards.md`](./api-standards.md)

Koşum: `pnpm test` (vitest). Kalite kapısı: `pnpm verify`.

Hedef: domain kararlarının sınırlarını zorlamak, frontend'e gitmeden sorunları ortaya çıkarmak, uygulama bütünlüğünü bozacak durumları yakalamak.

---

## Neden piramit değil

I/O ağırlıklı bir API'de her domain fonksiyonu DB okur, Redis'e yazar, kuyruğa iş atar. Mock'lanan her repo test edilmemiş bir varsayımdır. Ağırlık **entegrasyon katmanında** (Testing Trophy).

---

## Katmanlar

| Katman          | Kapsam                                       | Araç                           | Hız    |
| --------------- | -------------------------------------------- | ------------------------------ | ------ |
| 0 — Statik      | Tip, lint, mimari, ölü kod                   | `tsc`, eslint, depcruise, knip | saniye |
| 1 — Saf birim   | I/O'suz fonksiyonlar + domain karar ağaçları | vitest                         | ms     |
| 2 — Domain      | Karar mantığı, repo `vi.mock` ile            | vitest                         | ms     |
| 3 — Entegrasyon | `buildServer()` + gerçek Postgres/Redis      | vitest + `app.request()`       | saniye |
| 4 — Sözleşme    | OpenAPI snapshot + fuzzing                   | vitest + Schemathesis          | dakika |

### Katman seçim kuralı

| Soru                                          | Katman |
| --------------------------------------------- | ------ |
| Saf hesap / karar mı?                         | 1      |
| Birden çok repo'nun sırası / dallanması mı?   | 2      |
| Middleware, yetki, cache, zarf, SQL dahil mi? | 3      |
| Frontend sözleşmesi mi?                       | 4      |

Şüphedeyse **3**. Katman 2'yi yalnızca kombinasyon patlaması varsa kullan.

---

## Katman rolleri — sinyal borusu

Test yükü eşit dağılmaz. `apps` asıl yüzeydir; diğer katmanlar **kontrol ve bildirim noktasıdır.**

| Katman          | Testin rolü                                                                         | Yoğunluk   |
| --------------- | ----------------------------------------------------------------------------------- | ---------- |
| **apps**        | **Asıl yüzey** — domain kuralları, giriş kapıları, senaryolar                       | Çoğunluk   |
| modules         | Kontrol noktası — repo sözleşmesi (soft-delete filtresi, org kapsamı, enum tamlığı) | Az, keskin |
| platform        | Kontrol noktası — oturum / scope davranışı                                          | Az         |
| core            | Kontrol noktası — motor sözleşmesi                                                  | Az         |
| middlewares     | Ayrı test yok — `apps` entegrasyon testleri içinden geçiyor                         | Yok        |
| `app.config.ts` | **Ayrı test yok** — etkisi `apps` testlerinde ve OpenAPI snapshot'ta görünür        | Yok        |

Alt katman testlerinin değeri kapsama değil, **yer tespiti**:

| Ne kırmızı               | Hata nerede              |
| ------------------------ | ------------------------ |
| Yalnız `apps` testi      | Domain kuralında         |
| `apps` + `core` birlikte | Motorda — domain'e bakma |

Bu yüzden alt katman testleri az, hızlı ve **sözleşme düzeyinde** olur; iç detay test edilmez. Test adları alarmın kaynağını söylemeli: `"motor: mutation sonrası tag purge tetikleniyor"`.

### `app.config.ts` kuralı

Config'in kendi testi yoktur; **koruma testi yazılmaz** (`expect(max_limit).toBe(400)` sadece kopyadır). Etkisi iki yerde görünür:

1. Davranışı kilitleyen `apps` testleri — `limit = max_limit + 1` → 422, `limit = max_limit` → 200
2. OpenAPI snapshot diff'i

Hiçbir `apps` testinin dokunmadığı bir config değeri fiilen test edilmemiştir — bu da bir bilgidir (ya kullanılmıyordur ya da o uçta test eksiktir).

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

| Bağımlılık           | Local karşılığı                       | Not                                   |
| -------------------- | ------------------------------------- | ------------------------------------- |
| PostgreSQL           | compose `postgres` → `tiktak-test-v2` | ✅                                    |
| Redis                | compose `redis`                       | ✅ session, cache, rate-limit, BullMQ |
| S3                   | compose `minio`                       | ✅ upload geldiğinde                  |
| Socket.IO            | aynı süreç + `socket.io-client`       | ✅                                    |
| Mail                 | kuyruk doğrulaması (Redis)            | ✅ SMTP gerekmez                      |
| Push / FCM           | —                                     | ⚪ henüz endpoint yok                 |
| Google / Apple OAuth | `verifyOAuthIdToken` mock             | ⚠️ tek gerçek boşluk                  |

### Mail — iki seviye

Bu repo SMTP göndermez. `sendEmail` → `addMailJob` (BullMQ). Worker ayrı süreçte.

| Seviye                    | Ne doğrular                                 | Altyapı               |
| ------------------------- | ------------------------------------------- | --------------------- |
| 1 — kuyruk (zorunlu)      | doğru `key` / alıcı / link kuyruğa düştü mü | Redis                 |
| 2 — uçtan uca (opsiyonel) | şablon + SMTP                               | Mailpit + test worker |

Seviye 1, backend'in sahip olduğu sınırı test eder. Mailpit yalnızca **manuel geliştirme konforu** için compose'a eklenebilir (zorunlu değil). Gerçek worker bu repoya girerse Seviye 2 anlamlı olur.

### Mobile

| Anlam                 | Durum                                                            |
| --------------------- | ---------------------------------------------------------------- |
| `apps/mobile` yüzeyi  | Boş router; `surfaces.mobile` disabled — test edilecek route yok |
| Mail `platform` param | `resolvePlatform` — saf fonksiyon, katman 1                      |
| Push (`user_device`)  | Şema + repo hazır; auth route yok. Gelince kuyruk sınırında test |

Mobil istemcinin kendisi backend testinin konusu değil; HTTP sözleşmesi OpenAPI + entegrasyon ile kapsanır.

### OAuth

`verifyOAuthIdToken` uzak JWKS (`googleapis` / `appleid`) çeker; gerçek `id_token` local üretilemez.

| Seçenek          | Nasıl                                                              | Ne zaman                |
| ---------------- | ------------------------------------------------------------------ | ----------------------- |
| A — sınırda mock | `vi.mock` → `verifyOAuthIdToken`; `resolveOAuthUser` gerçek DB ile | Önerilen — refactor yok |
| B — local JWKS   | JWKS URL env'e; test RSA + sahte token                             | Tam offline gerekirse   |

Domain mantığı (`resolveOAuthUser`: identity bul, blocked, inactive→active, email bağla, transaction insert) tamamen local test edilir. jose doğrulaması kütüphane kodudur — mock sınırı burasıdır.

---

## Altyapı

### Veritabanı

`DATABASE_URL_TEST` → `tiktak-test-v2` (`scripts/local/postgres-init`).

### İzolasyon: truncate

Transaction rollback **kullanılmıyor** — `apps/public/invite/domain/flows.ts` ve `apps/auth/domain/oauth.ts` kendi içinde `db.transaction()` + `forUpdate()` çalıştırıyor; dıştan sarmak bu akışları bozar.

Tablolar test bitince durur; incelemek için yerinde kalır. Temizlik elle: `pnpm db:test:clean` (`tiktak-test-v2` + Redis db 15). Canlı veritabanına dokunmaz.

Redis test DB'si (db 15) her testten önce `FLUSHDB` olur — rate-limit sayacı birikmesin diye. Tablo satırları silinmez.

### Yardımcılar (`tests/`)

| Helper                                                        | Görev                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `assertTestDatabase()`                                        | URL `-test` içermiyorsa process exit                          |
| `resetDb()`                                                   | `pnpm db:test:clean` — truncate + Redis db 15                 |
| `makeOrganization` / `makePerson` / `makeUser` / `makeAccess` | Veri fabrikaları — test sadece önemsediği alanı override eder |
| `signInAs(user)`                                              | Gerçek `createSession` → `Bearer` token                       |
| `request(app, path, { token })`                               | `app.request` sarmalayıcısı, zarf parse                       |
| `assertInvariants(orgId)`                                     | Değişmez kontrolleri (aşağıda)                                |
| `Expect` / `Equal` / `Extends`                                | Tip-seviyesi iddia yardımcıları (`tests/types.ts`)            |

Fabrika kuralı: zorunlu alanlar varsayılan, benzersiz alanlar `randomUUID()`. Şemaya alan eklendiğinde tek yer değişir.

---

## Dosya yerleşimi

Testler **kodun yanında** durur; `tests/` yalnızca paylaşılan altyapıdır.

```
apps/web/employee/
├── doc.md
├── employee.routes.ts
├── employee.schema.ts
├── employee.integration.test.ts     ← katman 3: gerçek DB + HTTP
└── domain/
    ├── doc.md
    ├── create.ts
    ├── create.test.ts               ← katman 1-2: hızlı
    ├── employee-no.ts
    └── employee-no.test.ts

tests/
├── setup.ts
├── types.ts                          Expect / Equal / Extends
├── db.ts                             assertTestDatabase, resetDb
├── auth.ts                           signInAs
├── request.ts
├── invariants/                       assertInvariants(org)
├── factories/
└── integrity/                        genel kontroller
```

| Katman   | İsim                          |
| -------- | ----------------------------- |
| 1 / 2    | `<dosya>.test.ts`             |
| 3        | `<slice>.integration.test.ts` |
| Bütünlük | `tests/integrity/*.test.ts`   |

İki farklı sonek, hızlı/yavaş ayrı koşulabilsin diye. Testler barrel'dan import etmez ([`quality-tools.md`](./quality-tools.md) barrel politikası).

---

## Doküman senkronu

`doc.md` dosyaları domain fonksiyonlarını **adım adım** yazıyor. Kural: **doküman adımı = test adı.**

```ts
describe("createEmployee", () => {
  it("1. aktif employee varsa EMPLOYEE_ALREADY_EXISTS", ...);
  it("2. employee_no verilmezse sıradaki numarayı alır", ...);
  it("2. verilen numara doluysa EMPLOYEE_NO_IN_USE", ...);
  it("3. experience_id boş bırakılabilir", ...);
});
```

Kazanç: test çıktısını okuyan dokümanı okumuş olur; dokümana adım eklenince karşılığı olmayan numara göze çarpar; kırılan test hangi kuralın bozulduğunu adıyla söyler.

Ters yön: her `doc.md` başına test dosyası satırı —

```markdown
Testler: `create.test.ts` · `employee.integration.test.ts`
```

Doküman ile testi otomatik %100 senkron tutmanın yolu yoktur. Doküman "ne yapmalı", test "gerçekten yapıyor mu" der; aynı kelimelerle yazılırsa ayrışma insan gözüne çarpar.

---

## Senaryo üretimi

### Doğrulama ≠ geçerlilik

| Soru                                | Adı        | Kaynağı                    |
| ----------------------------------- | ---------- | -------------------------- |
| "Kod, yazıldığı gibi çalışıyor mu?" | Doğrulama  | Kodun kendisi              |
| "Yazılan şey doğru muydu?"          | Geçerlilik | Koddan **bağımsız** kaynak |

Testi kodu okuyarak yazarsan, test kodun yaptığını onaylamaktan başka bir şey yapamaz — kod yanlışsa yanlışı kilitler. **Koddan türetme gerekli ama yetmez.**

### A — Koddan türetilenler (doğrulama)

| Kaynak          | Yöntem                                                         |
| --------------- | -------------------------------------------------------------- |
| Her `throw`     | `rg "AppError\(" apps/<slice>/domain` — her satır bir senaryo  |
| Her `if`        | İki senaryo: doğru / yanlış dal                                |
| Her şema alanı  | Boş, `null`, çok uzun, yanlış tip, sınır değeri                |
| Her enum değeri | `it.each` tablosu — tablo uzunluğu enum uzunluğuna eşit olmalı |
| Rol × endpoint  | Yetki matrisi                                                  |

### B — Koddan türetilemeyenler (geçerlilik)

**Değişmezler** — hangi fonksiyon çalışırsa çalışsın her zaman doğru olması gerekenler. Tek fonksiyonun kodundan çıkmaz; sistemin bütününe bakılarak yazılır.

`employee` + `person` için:

| Değişmez                                                       |
| -------------------------------------------------------------- |
| Her aktif employee'nin bir person'ı vardır                     |
| `person.employee_id` ↔ `employee.person_id` birbirini gösterir |
| Bir org'da bir person'ın en fazla bir aktif employee'si olur   |
| Aktif employee'ler arasında `employee_no` tekrar etmez         |
| Silinmiş employee'nin numarası serbest kalır                   |

Her entegrasyon testinin sonunda `await assertInvariants(orgId)`. Kodu hiç okumadan yazılır, kodun kaçırdığı tutarsızlığı yakalar — özellikle çok tabloya dokunan akışlarda (`createEmployeeViaCreator`, `softDeleteEmployee`, invite accept).

Her modülün `doc.md`'sine **"Değişmezler"** bölümü eklenir; test oradan yazılır.

**Yolculuk testleri** — tek fonksiyon doğru, arka arkaya çalışınca bozuluyor. Hiçbir fonksiyonun kodunda yazmaz.

Klasik kalıp: **oluştur → sil → yeniden oluştur.**

```
1. creator ile personel ekle (no: 5)
2. sil
3. aynı kişiyi creator ile tekrar ekle
   → numara 5 mi, yeni mi?
   → person restore mu edilir, yenisi mi açılır?
   → person.employee_id doğru bağlanır mı?
```

**"Ya şöyle olursa" listesi** — sistematik sorular:

- Aynı bilgi iki farklı yoldan gelirse hangisi kazanır?
- Silinmiş bir kayıtla işlem yapılırsa?
- Başka org'a ait bir id gösterilirse?
- Yetkisi olmayan biri dolaylı yoldan aynı sonuca ulaşabilir mi?

### Sıralama — önce sarsıcı olanlar

Önce 200 koddan-türetilmiş test yazıp sonra "kural yanlışmış" denirse 200 test de değişir. Her slice'ta sıra:

1. Değişmez kontrolü
2. Bir sil → geri ekle yolculuğu
3. "Ya şöyle olursa" listesinden 3–5 soru
4. **Sonra** dal testleri

### Kırmızı testin üç anlamı

| İhtimal                  | Yapılacak             |
| ------------------------ | --------------------- |
| Test yanlış yazılmış     | Testi düzelt          |
| Kod kurala uymuyor       | Kodu düzelt           |
| **Kural yanlış / eksik** | Karar gerekiyor — dur |

Üçüncüsü en değerli sonuçtur. Süreç:

1. `it.todo("blocked person creator ile aktifleşmeli mi?")` — çalışmaz, listede durur, CI'ı kilitlemez
2. Kararı ver ve **`doc.md`'ye yaz**
3. Kodu karara uydur
4. Testi yeşile çevir

Sıralama önemli: **doküman → kod → test.** Tersi, dokümanla kod arasındaki bağı koparır.

---

## Zorunlu test kategorileri

Yeni bir slice eklendiğinde bunlar yazılmadan PR açılmaz.

### 1. Mutlu yol

Her endpoint için en az bir 200.

### 2. Yetki matrisi

| Aktör               | Beklenen  |
| ------------------- | --------- |
| anonim              | 401       |
| üye, yetkisiz       | 403       |
| **başka org üyesi** | 403 / 404 |
| yetkili üye         | 200       |
| süper admin         | 200       |

Üçüncü satır en kritiği: çok kiracılı sistemde en pahalı hata sınıfı veri sızıntısıdır.

### 3. Domain sınırları

Her `AppError` dalı için bir test. Hata testinde **yan etkinin oluşmadığı** da doğrulanır (`expect(repo.insert).not.toHaveBeenCalled()`).

### 4. Sınır değerleri

`<=` / `<` kararları, boş liste, `page=0`, `limit` üst sınırı, `null` vs `undefined`.

### 5. Eşzamanlılık

`Promise.all` ile iki eşzamanlı çağrı:

| Akış                        | Beklenen                                                      |
| --------------------------- | ------------------------------------------------------------- |
| Davet kabul (aynı token)    | Biri 200, diğeri `INVITE_ALREADY_ACCEPTED`; tek access satırı |
| `employee_no` tahsisi       | İki farklı numara                                             |
| Refresh rotate (aynı token) | Biri başarılı, diğeri reddedilir                              |

### 6. Cache tutarlılığı

Mutation sonrası ilgili GET bayat dönmemeli. `schedulePurge` fire-and-forget olduğu için testte purge'ün tamamlanması beklenir.

---

## Bütünlük testleri (`tests/integrity/`)

Slice'tan bağımsız iddialar. Her biri 5–10 satır, kalıcı koruma.

| İddia                                                 | Kırılırsa              |
| ----------------------------------------------------- | ---------------------- |
| `AppError` kodları ⊆ `ERROR_META`                     | Yanlış HTTP status     |
| `ERROR_META` anahtarları = `en`/`tr`/`de` errors.json | Frontend metni çözemez |
| Mutation route `name` ⊆ success.json                  | Zarf kodu eksik        |
| Route path'leri snake_case sözleşmesi                 | Tutarsız API           |
| `cache.read.tags` ↔ bir `cache.write.purge` eşleşmesi | **Bayat cache**        |
| Her route'un `tenant` değeri kayıtlı scope            | Boot'ta throw          |
| `doc.md` "Tüketiciler" tabloları güncel mi            | Etki analizi yanıltır  |

---

## Derleme zamanı korumalar

Bazı hatalar test gerektirmez — derleyici anında söyler. Test yükünü azalttığı için **önce bunlar kurulur.**

| Koruma                               | Yakaladığı                        | Detay                                    |
| ------------------------------------ | --------------------------------- | ---------------------------------------- |
| Enum tek kaynak (`@/modules/db`)     | Enum değeri silindi / adı değişti | [`database.md`](./database.md)           |
| Karar tablosu `Record<Enum, …>`      | Enum'a **yeni değer eklendi**     | aşağıda                                  |
| `Row = Pick<Selectable<T>, COLUMNS>` | Kolon silindi / tipi değişti      | [`database.md`](./database.md)           |
| `z.toZod<Hedef>()`                   | Şema çıktısı hedef tipten saptı   | [`api-standards.md`](./api-standards.md) |
| `satisfies Record<K, V>`             | Eksik anahtar (ör. `ERROR_META`)  | [`quality-tools.md`](./quality-tools.md) |

### Enum tamlığı — kontrol noktası

Enum'a **değer eklemek** tip sisteminde sessizdir: hiçbir `if` zinciri kırılmaz, yeni değer hiçbir karar ağacında ele alınmaz. Çözüm, kararı tablo olarak yazmak:

```ts
import { AccessStatus } from "@/modules/db";

const BLOCKING: Record<AccessStatus, boolean> = {
  pending: false,
  active: true,
  inactive: true,
  blocked: true,
  canceled: false,
};
```

Prisma'ya yeni değer eklendiğinde `Record` eksik anahtar verir → **derleme hatası**: "bu değer için karar yaz". Bu koruma `modules` katmanında durur — az, keskin, enum değiştiği an çalar.

---

## Değişiklik etkisi

Bir domain kararı veya enum değiştiğinde etkilenen alan hafızaya bırakılmaz. Testler yeşilse bu "hiçbir şey bozulmadı" değil, **"kapsadığım yerlerde bozulma yok"** demektir.

### Tespit katmanları (erken → geç)

| #   | Araç                                   | Yakaladığı                                                     |
| --- | -------------------------------------- | -------------------------------------------------------------- |
| 1   | `tsc`                                  | Tek kaynaklı sabit/enum/kolon değişince kırılan her çağrı yeri |
| 2   | `depcruise` ters bağımlılık            | "Bu dosyayı kim okuyor?"                                       |
| 3   | `vitest related <dosya>` / `--changed` | Değişen dosyayla ilgili testler                                |
| 4   | `assertInvariants`                     | Kimsenin düşünmediği çapraz bozulma                            |
| 5   | `doc.md` "Tüketiciler" tabloları       | İnsan gözüyle son kontrol                                      |

### Karar değişikliği kontrol listesi

1. **Karar nerede yazılı?** `app.config.ts`, `modules/<entity>/*.prisma`, yoksa sadece bir `doc.md` cümlesi mi? (Üçüncüsüyse önce tek yere taşı.)
2. **Kim okuyor?** `rg` + `depcruise` + ilgili `doc.md` "Tüketiciler".
3. **Hangi değişmezler etkilenir?**
4. **`doc.md` güncelle** — önce doküman.
5. **Kodu karara uydur.**
6. **`vitest related` → sonra tamamı.**
7. **OpenAPI snapshot değişti mi?** Değiştiyse frontend etkileniyor — diff'i oku, haber ver.

Kırmızı listesi beklenenden kısaysa kapsam eksiktir; o da bir bilgidir.

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

## Koşum kapsamı

Günlük kullanım parça parçadır; tamamı yalnızca commit öncesi koşar.

| Ne istiyorsun    | Komut                                               |
| ---------------- | --------------------------------------------------- |
| Tek dosya        | `pnpm test apps/web/employee/domain/create.test.ts` |
| Bir klasör       | `pnpm test apps/web/employee`                       |
| Adında geçen     | `pnpm test -t "employee_no"`                        |
| Yazarken sürekli | `pnpm test --watch apps/web/employee`               |
| Değişenle ilgili | `pnpm test --changed`                               |
| Hepsi            | `pnpm test`                                         |

### Hızlı / yavaş ayrımı

| Script      | Ne koşar                | Gereksinim               |
| ----------- | ----------------------- | ------------------------ |
| `test:unit` | `*.test.ts`             | Yok — Docker'sız çalışır |
| `test:int`  | `*.integration.test.ts` | Docker ayakta            |
| `test`      | Hepsi                   | Docker ayakta            |

`it.only` ile geçici odaklanma serbest; commit'e sızmaması için lint kuralı konur.

---

## Sonuçları görme ve yorumlama

### Görme

| İhtiyaç                | Yol                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Hangi test geçti/kaldı | `pnpm test --reporter=verbose` — doküman adımları ekrana dökülür                                                            |
| Ne bekledim / ne geldi | Vitest otomatik diff                                                                                                        |
| DB'de ne oluştu        | `onTestFailed` kancasıyla ilgili tabloları bas                                                                              |
| Veriyi inceleyeyim     | Testten sonra satırlar durur. `NODE_ENV=test pnpm exec dotenv -e .env.local -- prisma studio`. Bitince `pnpm db:test:clean` |
| Görsel panel           | `pnpm test --ui` (`@vitest/ui`)                                                                                             |
| Satırda durup bakayım  | `pnpm test --inspect-brk --no-file-parallelism <yol>`                                                                       |

```ts
onTestFailed(async () => {
  console.log(
    "employee:",
    await db.selectFrom("employee").selectAll().execute(),
  );
  console.log("son yanıt:", lastResponseBody);
});
```

### Yorumlama

| Metrik         | Ne söyler                           | Ne söylemez                |
| -------------- | ----------------------------------- | -------------------------- |
| Yeşil/kırmızı  | Bilinen kurallar korunuyor          | Kural doğru mu             |
| Coverage       | Hangi satır **çalıştı**             | Hangi satır **doğrulandı** |
| Mutation score | Testler gerçekten hata yakalıyor mu | —                          |
| Süre           | Katman dengesi bozulmuş mu          | —                          |

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
- Derleyicinin yakalayabildiği şey için test yazılmaz.
- `doc.md` → kod → test sırası bozulmaz.

---

## Yol haritası

| Aşama | İş                                                                                 | Durum |
| ----- | ---------------------------------------------------------------------------------- | ----- |
| 0     | Derleme zamanı korumalar: enum tek kaynak, `Row` türetme, `z.toZod`                | ✅    |
| 1     | Altyapı: `assertTestDatabase`, `resetDb`, fabrikalar, `signInAs`, `tests/types.ts` | ✅    |
| 2     | Bütünlük testleri                                                                  | ✅    |
| 3     | OpenAPI snapshot                                                                   | ✅    |
| 4     | `apps/auth` uçtan uca                                                              | ✅    |
| 5     | Yetki matrisi (`tests/integrity/policy.integration.test.ts`)                       | ✅    |
| 6     | Davet akışı + race + değişmezler (`apps/public/invite/invite.integration.test.ts`) | ✅    |
| 7     | Kalan slice'lar (person, employee, access, role, permission, organization, user)   | ✅    |
| 8     | Schemathesis CI                                                                    | ⬜    |
| 9     | Property-based + mutation                                                          | ⬜    |

Aşama 0 test değil, tip işidir — ama en ucuz korumayı verdiği için önce gelir.

---

## Bilinen riskler

Test yazılınca doğrulanacak:

| #   | Risk                                                                      | Konum                                     |
| --- | ------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | `hydrateScope` cache prefix'ini query/body'den alıyor — prefix kirlenmesi | `platform/scope/resolve.ts`               |
| 2   | `revokeOrganizationSessions` sessiz başarısızlık (catch + devam)          | `platform/auth/revoke-organization.ts`    |
| 3   | Eşzamanlı refresh meşru oturumu düşürebilir                               | `platform/auth/session.ts`                |
| 4   | `purge` yazılmamış mutation'lar → bayat cache                             | `apps/**/*.routes.ts`                     |
| 5   | `employee_no` tahsis yarışı                                               | `apps/web/employee/domain/employee-no.ts` |

## Karar bekleyen domain soruları

Bunlar test değil, **ürün kararıdır**; cevaplanmadan test yazılmaz (`it.todo` ile bekletilir).

| #   | Soru                                                                                      | Konum                                 |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | `person_id` + `user_id` + `email` birlikte gelirse: sessiz öncelik mi, çelişki hatası mı? | `apps/web/employee/domain/creator.ts` |
| 2   | Soft-delete edilmiş `blocked` person, creator ile restore edilince `active` olmalı mı?    | `creator.ts` — `restoreAndUpdate`     |
| 3   | `employee_no` sil/geri-ekle sonrası korunmalı mı, yeni mi verilmeli?                      | `soft-delete.ts` + `employee-no.ts`   |
