# web

İndeks: [`apps/doc.md`](../doc.md)

**Dosya:** `index.ts` (`webRouter`)  
**Mount:** `app_config.surfaces.web` — enabled, önek `/web`  
**Auth:** `authMiddleware`  
**Handle:** bu adımda `NOT_IMPLEMENTED`

Kayıtlar, web uygulamasında bir ekranın import ettiği hook'un çağırdığı yollardır. Slice listesi `index.ts` içindedir. Auth ve ortak kaynaklar (`access`, `address`, `bank-account`, `country`, `file`, `invite`, `social-media`) web yüzeyinde değildir. Davet linki `public` yüzeyindedir.
