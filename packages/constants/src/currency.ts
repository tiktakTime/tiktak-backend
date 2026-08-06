export const SUPPORTED_CURRENCIES = ["TRY", "EUR", "USD", "GBP"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
