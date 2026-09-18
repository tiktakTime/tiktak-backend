import { ERROR_META } from "./catalog.meta";
import deErrors from "./de/errors.json";
import deSuccess from "./de/success.json";
import deValidation from "./de/validation.json";
import enErrors from "./en/errors.json";
import enSuccess from "./en/success.json";
import enValidation from "./en/validation.json";
import trErrors from "./tr/errors.json";
import trSuccess from "./tr/success.json";
import trValidation from "./tr/validation.json";

export type CatalogText = { title: string; message: string };
export type ValidationText = { message: string };

export type ErrorKey = keyof typeof enErrors;
export type SuccessKey = keyof typeof enSuccess;
export type ValidationKey = keyof typeof enValidation;

/** Diller arası eksiksizlik — eksik anahtar derleme hatası. */
const _trErrors: Record<ErrorKey, CatalogText> = trErrors;
const _deErrors: Record<ErrorKey, CatalogText> = deErrors;
const _trSuccess: Record<SuccessKey, CatalogText> = trSuccess;
const _deSuccess: Record<SuccessKey, CatalogText> = deSuccess;
const _trValidation: Record<ValidationKey, ValidationText> = trValidation;
const _deValidation: Record<ValidationKey, ValidationText> = deValidation;

void _trErrors;
void _deErrors;
void _trSuccess;
void _deSuccess;
void _trValidation;
void _deValidation;

export type LocaleBundle = {
  errors: Record<ErrorKey, CatalogText>;
  success: Record<SuccessKey, CatalogText>;
  validation: Record<ValidationKey, ValidationText>;
};

export const bundles = {
  en: {
    errors: enErrors as Record<ErrorKey, CatalogText>,
    success: enSuccess as Record<SuccessKey, CatalogText>,
    validation: enValidation as Record<ValidationKey, ValidationText>,
  },
  tr: {
    errors: trErrors as Record<ErrorKey, CatalogText>,
    success: trSuccess as Record<SuccessKey, CatalogText>,
    validation: trValidation as Record<ValidationKey, ValidationText>,
  },
  de: {
    errors: deErrors as Record<ErrorKey, CatalogText>,
    success: deSuccess as Record<SuccessKey, CatalogText>,
    validation: deValidation as Record<ValidationKey, ValidationText>,
  },
} as const satisfies Record<"en" | "tr" | "de", LocaleBundle>;

export type SupportedLocale = keyof typeof bundles;

export { ERROR_META };
export type { ErrorMetaKey } from "./catalog.meta";

declare module "@/core/http/catalog" {
  interface CatalogRegistry {
    error: keyof typeof enErrors;
    success: keyof typeof enSuccess;
  }
}
