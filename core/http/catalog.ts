/**
 * Katalog mekanizması — içerik `i18n/` altında.
 * Core domain-free; anahtar tipleri module augmentation ile gelir.
 */

export type ApiSemanticStatus = "success" | "info" | "warning" | "error";

/** Bundle girdilerinin metin kısmı. */
export type CatalogText = {
  title: string;
  message: string;
};

/**
 * App tarafı (`i18n/index.ts`) doldurur.
 * @example
 * declare module "@/core/http/catalog" {
 *   interface CatalogRegistry { error: ErrorKey; success: SuccessKey }
 * }
 */
export interface CatalogRegistry {}

export type ErrorKey = CatalogRegistry extends { error: infer E }
  ? E extends string
    ? E
    : string
  : string;

export type SuccessKey = CatalogRegistry extends { success: infer S }
  ? S extends string
    ? S
    : string
  : string;

export type CatalogKey = ErrorKey | SuccessKey;
