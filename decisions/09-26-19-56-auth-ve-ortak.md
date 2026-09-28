# Auth ve ortak access, country, file

Tarih: 2026-09-26 · Durum: Geçerli

Karar: Oturum uçları tek kayıt olarak `apps/auth` altındadır, yol `/auth/...` dir. Erişim, ülke ve dosya `apps/common` altındadır, önek `/common`.

Gerekçe: Bu işlemler cihaza göre değişmez; web ve mobile kopyası tutulmaz.
