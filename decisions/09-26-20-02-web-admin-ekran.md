# Web ve admin ekran çağrıları

Tarih: 2026-09-26 · Durum: Geçerli

Karar: `apps/web` yalnız web ekranlarının çağırdığı ve ortak yüzeye ait olmayan yolları tutar. Süperadmin ekranlarının çağırdığı yollar `apps/admin` altındadır.

Gerekçe: Oturum, erişim, ülke, dosya, adres, banka hesabı ve sosyal medya zaten tek kayıtta durur.
