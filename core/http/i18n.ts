/**
 * Locale pazarlığı + interpolasyon + bundle erişimi.
 * İçerik `@/platform/i18n` üzerinden `configureI18n` ile bağlanır.
 */
import type {
  ApiSemanticStatus,
  CatalogText,
  ErrorKey,
  SuccessKey,
} from "./catalog";

export type LocaleCode = string;

export type ValidationText = { message: string };

export type LocaleBundle = {
  errors: Record<string, CatalogText>;
  success: Record<string, CatalogText>;
  validation: Record<string, ValidationText>;
};

/** Hata girdisi meta — anahtar kümesini app tarafı (`i18n/`) belirler. */
export type ErrorMeta = {
  status: number;
  /** Wire `status` alanı; verilmezse `"error"`. */
  severity?: Exclude<ApiSemanticStatus, "success">;
};

export type I18nConfig = {
  bundles: Record<string, LocaleBundle>;
  defaultLocale: LocaleCode;
  errorMeta: Record<string, ErrorMeta>;
};

let config: I18nConfig | null = null;

/** Mutation `name` kayıtları — `configureI18n` sonrası doğrulanır. */
const pendingMutationNames: string[] = [];

export function configureI18n(next: I18nConfig) {
  if (!next.bundles[next.defaultLocale]) {
    throw new Error(
      `configureI18n: defaultLocale "${next.defaultLocale}" missing from bundles`,
    );
  }
  config = next;

  const success = next.bundles[next.defaultLocale]!.success;
  for (const name of pendingMutationNames) {
    if (!success[name]) {
      throw new Error(
        `Missing success catalog entry for mutation route "${name}"`,
      );
    }
  }
  pendingMutationNames.length = 0;
}

function requireI18n(): I18nConfig {
  if (!config) {
    throw new Error(
      "configureI18n() must run before handling requests (see server/index.ts)",
    );
  }
  return config;
}

/**
 * Mutation route'ları için success.json zorunluluğu.
 * GET opsiyonel. `configureI18n` henüz yoksa kuyruğa alınır.
 */
export function registerMutationSuccessKey(name: string) {
  if (!config) {
    pendingMutationNames.push(name);
    return;
  }
  const success = config.bundles[config.defaultLocale]!.success;
  if (!success[name]) {
    throw new Error(
      `Missing success catalog entry for mutation route "${name}"`,
    );
  }
}

/**
 * Accept-Language → desteklenen locale.
 * Fallback: exact → language tag → defaultLocale.
 */
export function negotiateLocale(header: string | undefined | null): LocaleCode {
  const { bundles, defaultLocale } = requireI18n();
  const supported = new Set(Object.keys(bundles));

  if (!header) return defaultLocale;

  const prefs = header
    .split(",")
    .map((part) => {
      const [tagRaw, ...params] = part.trim().split(";");
      const tag = (tagRaw ?? "").trim().toLowerCase();
      let q = 1;
      for (const p of params) {
        const [k, v] = p.trim().split("=");
        if (k === "q" && v) q = Number(v) || 0;
      }
      return { tag, q };
    })
    .filter((p) => p.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of prefs) {
    if (supported.has(tag)) return tag;
    const base = tag.split("-")[0]!;
    if (supported.has(base)) return base;
  }

  return defaultLocale;
}

/** Basit `{param}` interpolasyonu. */
export function interpolate(
  template: string,
  params: Record<string, unknown> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

function bundleFor(locale: LocaleCode): LocaleBundle {
  const { bundles, defaultLocale } = requireI18n();
  return bundles[locale] ?? bundles[defaultLocale]!;
}

export function resolveError(
  key: ErrorKey | string,
  locale: LocaleCode,
  params: Record<string, unknown> = {},
): CatalogText & { found: boolean } {
  const entry = bundleFor(locale).errors[key];
  if (!entry) {
    const fallback = bundleFor(locale).errors.INTERNAL_ERROR ?? {
      title: "Something went wrong",
      message: "An unexpected error occurred. Please try again.",
    };
    return {
      title: fallback.title,
      message: interpolate(fallback.message, params),
      found: false,
    };
  }
  return {
    title: entry.title,
    message: interpolate(entry.message, params),
    found: true,
  };
}

export function resolveSuccess(
  key: SuccessKey | string,
  locale: LocaleCode,
  params: Record<string, unknown> = {},
): CatalogText & { found: boolean } {
  const entry = bundleFor(locale).success[key];
  if (!entry) {
    return { title: "", message: "", found: false };
  }
  return {
    title: entry.title,
    message: interpolate(entry.message, params),
    found: true,
  };
}

export function resolveValidation(
  key: string,
  locale: LocaleCode,
  params: Record<string, unknown> = {},
): { message: string; code: string } {
  const bundle = bundleFor(locale).validation;
  const entry = bundle[key] ?? bundle.unknown;
  const message = entry
    ? interpolate(entry.message, params)
    : "This value is not valid.";
  return { message, code: bundle[key] ? key : "unknown" };
}

export function lookupErrorMeta(key: string): ErrorMeta {
  const { errorMeta } = requireI18n();
  return errorMeta[key] ?? { status: 500 };
}

export function hasSuccessKey(key: string): boolean {
  const { bundles, defaultLocale } = requireI18n();
  return Boolean(bundles[defaultLocale]?.success[key]);
}

export function getConfiguredLocales(): string[] {
  return Object.keys(requireI18n().bundles);
}

export function getDefaultLocale(): LocaleCode {
  return requireI18n().defaultLocale;
}
