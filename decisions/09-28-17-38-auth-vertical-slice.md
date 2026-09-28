# Auth vertical slice paketleme

**Tarih:** 2026-09-28 17:38 · **Durum:** Geçerli

**Karar:** Her auth ucu `routes/<uç>.ts` içinde şema + `defineRoute` + iş mantığını taşır; `auth.routes.ts` yalnızca `createSlice` ile birleştirir; ortak yardımcılar `utils/` altındadır.

**Gerekçe:** Uç eklerken veya değiştirirken tek dosyaya bakmak yeterli olsun; monolitik `auth.schema.ts` ve ayrı `domain/` katmanı kalktı.

**Değişen:** `domain/` + `auth.schema.ts` → `routes/` + `utils/response.ts`
