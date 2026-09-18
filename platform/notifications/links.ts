import { env } from "@/core/env";

export type MailPlatform = "web" | "mobile";

export function resolvePlatform(input?: string | null): MailPlatform {
  const value = (input || "").toLowerCase();
  if (value === "ios" || value === "android" || value === "mobile") {
    return "mobile";
  }
  return "web";
}

/** `{base}{path}?token=...&platform=...` */
export function buildVerificationLink(
  path: string,
  token: string,
  platform: MailPlatform = "web",
): string {
  const base = env.WEB_BASE_URL.replace(/\/+$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);
  url.searchParams.set("token", token);
  url.searchParams.set("platform", platform);
  return url.toString();
}
