# Kullanılan yollar ve common

Tarih: 2026-09-26 · Durum: Geçerli

Karar: Web ve mobile yüzeyinde yalnızca o projenin kodunun çağırdığı yollar durur. Adres, banka hesabı ve sosyal medya bir kez `apps/common` altında, önek `/common` ile durur. Diğer çağrılan yollar kendi yüzeyinde ayrı handle olarak kalır.

Gerekçe: Katalogda olup ekranın çağırmadığı uç kaydı gürültüdür. Bu üç kaynak iki istemcide de aynı ortak kayıttır.

Değişen: her katalog yolu yüzeye kopyalanır → yalnızca çağrılan yol kalır; bu üç kaynak web/mobile kopyası → `/common`.
