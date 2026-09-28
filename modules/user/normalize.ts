/** Kayıt ve karşılaştırma için trim + küçük harf. */
export function emailOf(value: string): string {
  return value.trim().toLowerCase();
}

/** Trim edilmiş ad, bir boşluk, trim edilmiş soyad. */
export function fullName(first: string, last: string): string {
  return `${first.trim()} ${last.trim()}`;
}
