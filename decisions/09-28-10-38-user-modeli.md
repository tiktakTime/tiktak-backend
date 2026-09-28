# User modeli bağımlılıksız kopyalandı

Tarih: 2026-09-28 · Durum: Yerine geçti → [09-28-13-29-user-modul-iliskileri](./09-28-13-29-user-modul-iliskileri.md)

Karar: Humans v2 `user` tablosu tam kopya taşınır. `country_id`, `nationality_id` ve `system_role_id` uuid kolon olarak durur, `@relation` yazılmaz. Repo ve migration yazılmaz.

Gerekçe: User başka tabloya bağlanmadan en üstte durmalı. Geliştirme bu kopyanın üstünde yapılacak.
