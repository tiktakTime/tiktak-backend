# Model oluşturma sırası

Tarih: 2026-09-28 · Durum: Geçerli

Karar: Yeni modelde sıra taslak, kesinleştirme, alt modeller, onların kesinleşmesi ve ancak ondan sonra `pnpm db:generate` olur. Migration ve repo bu sıraya girmez.

Gerekçe: Generate erken çalışırsa kesinleşmemiş şema tipe karışır. Ayrıntı `docs/database.md`. Agent kuralı `.cursor/rules/model-olusturma.mdc`.
