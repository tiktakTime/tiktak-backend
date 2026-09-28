# Eski domain ve modeller silindi

Tarih: 2026-09-28 · Durum: Geçerli

Karar: `apps` altındaki eski domain klasörleri ve `modules` altındaki Prisma model dosyaları silinir. `schema.prisma` ve repo dosyaları durur.

Gerekçe: Route'lar bu domain'i çağırmıyor. Modeller humans'tan baştan taşınacak.
