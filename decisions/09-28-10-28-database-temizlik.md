# Eski veritabanı kalıntısı silindi

Tarih: 2026-09-28 · Durum: Geçerli

Karar: `core/database` içindeki eski migration’lar ve üretilmiş tablo tipleri silinir. Bağlantı havuzu durur. `DB` tipi boştur.

Gerekçe: Modeller tek tek taşınacak. Eski şemanın SQL’i ve tipleri yeni modele karışmasın.
