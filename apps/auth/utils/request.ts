import type { Context } from "hono";

import type { AppBindings } from "@/core/router";
import { DevicePlatform } from "@/modules/db";

export type AuthRequest = {
  platform?: string | null;
  installationId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export function authRequest(c: Context<AppBindings>): AuthRequest {
  return {
    platform: c.req.header("platform"),
    installationId: c.req.header("x-installation-id"),
    ip: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip"),
    userAgent: c.req.header("user-agent"),
  };
}

export function devicePlatform(input?: string | null): DevicePlatform {
  const value = (input || "").toLowerCase();
  if (value === "ios") return DevicePlatform.ios;
  if (value === "android") return DevicePlatform.android;
  return DevicePlatform.web;
}

export function clientIp(value?: string | null): string | null {
  const ip = value?.split(",")[0]?.trim();
  if (!ip) return null;
  if (/^[a-fA-F0-9:.]+$/.test(ip)) return ip;
  return null;
}
