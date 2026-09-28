# Yüzey önekli route kaydı

Tarih: 2026-09-26 · Durum: Yerine geçti → [09-26-18-50-kullanilan-ve-common.md](./09-26-18-50-kullanilan-ve-common.md)

Karar: Web ve mobilin çağırdığı yollar, taşınmayacak liste hariç, aynı isimle `apps/web` (`/web`) ve `apps/mobile` (`/mobile`) altına ayrı handle olarak kaydedilir. Süperadmin yolları `apps/admin` (`/admin`) altındadır. Eski HTTP route kayıtları silinir. Bu adımda handle `NOT_IMPLEMENTED` fırlatır.

Gerekçe: Aynı iş iki istemcide de olsa kapı ayrı kalacak; kaçan yol kalmaması için bugünkü isimler korunur.

Değişen: katalogdaki çağrılmayan uçlar silindi; address, bank-account ve social-media `/common` altına alındı.
