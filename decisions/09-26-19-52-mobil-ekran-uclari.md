# Mobil kayıtları ekran çağrısı

Tarih: 2026-09-26 · Durum: Geçerli

Karar: `apps/mobile` yalnız `tiktak-mobile-v2` içinde `app/` ekranından ulaşılan hook’ların çağırdığı yolları tutar. Adres ve banka hesabı `apps/common` altında kalır.

Gerekçe: Servis dosyasındaki çağrılmayan fonksiyonlar mobil yüzeye uç eklemez.
