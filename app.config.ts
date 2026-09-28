/**
 * Application decisions that belong in git (not secrets).
 * Secrets / env URLs stay in `core/env`.
 *
 * Yüzey yerleşimi:
 * - web: web istemcisinin yolları, önek `/web`
 * - mobile: mobil istemcinin yolları, önek `/mobile`
 * - admin: süperadmin yolları, önek `/admin`
 * - public: bu adımda boş
 * - common: address, bank-account, social-media, access, country, file — önek `/common`
 *
 * `apps/auth` oturum uçları — tüm cihazlar, yol `/auth/...`.
 * `apps/system` süreç sağlık uçları — yüzey değil.
 *
 * İstemci yolları yüzey önekiyle ayrılır: `/web`, `/mobile`, `/admin`, `/common`.
 * Aynı yol iki istemcideyse iki route ve iki handle vardır.
 * Ortak kaynaklar (address, bank-account, social-media) yalnızca `/common` altındadır.
 */
export const app_config = {
  openapi: {
    title: "TikTak Backend API",
    version: "1.0.0",
    spec_path: "/openapi.json",
    docs_path: "/docs",
  },

  cache: {
    enabled: true,
    /** FE query-key strategy for socket invalidate payloads. */
    invalidate_key_type: "react-query" as "react-query" | "unity" | null,
    ttl: {
      miss_ms: 1000 * 30,
      default_ms: 1000 * 60 * 5,
      long_ms: 1000 * 60 * 10,
    },
    /**
     * Tenant adı → cache uygunluğu.
     * `required: true` → cacheKey çözülemezse yazma/okuma yok (global key yok).
     * `allowed: false` → bu tenant’ta response cache kapalı.
     * Key üretimi `configureRoutePlatform({ scopes })` cacheKey’inde.
     */
    scopes: {
      org: { required: true },
      member: { required: true },
      orgParam: { required: true },
      none: { allowed: false },
    },
  },

  pagination: {
    default_page: 1,
    default_limit: 20,
    max_limit: 400,
  },

  rate_limit: {
    standard: { window_ms: 60_000, max_requests: 2000 },
    auth: { window_ms: 60_000, max_requests: 20 },
    invite: { window_ms: 60_000, max_requests: 20 },
  },

  surfaces: {
    public: { enabled: true, prefix: "/" },
    common: { enabled: true, prefix: "/common" },
    web: { enabled: true, prefix: "/web" },
    mobile: { enabled: true, prefix: "/mobile" },
    admin: { enabled: true, prefix: "/admin" },
  },

  /**
   * Dosya / görüntü ürün kararları — mekanizma `@/core/files`.
   * Profil ve allowlist burada; sharp pipeline core’da.
   */
  files: {
    max_file_size_bytes: 20 * 1024 * 1024,
    max_files_per_reference: 30,
    max_files_per_request: 10,
    allowed_extensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".heic",
      ".heif",
      ".svg",
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".ogg",
      ".flac",
      ".opus",
    ] as const,
    allowed_image_mime_types: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
      "image/heic",
      "image/heif",
    ] as const,
    /** Soft limit — optimize öncesi MIME başına. */
    max_image_size_by_mime: {
      "image/png": 3 * 1024 * 1024,
      "image/jpeg": 1.5 * 1024 * 1024,
      "image/webp": 1.5 * 1024 * 1024,
      "image/svg+xml": 512 * 1024,
      "image/heic": 10 * 1024 * 1024,
      "image/heif": 10 * 1024 * 1024,
    } as const,
    image_profiles: {
      avatar: { width: 500, height: 500, fit: "cover" as const, quality: 85 },
      proof: { maxEdge: 2560, fit: "inside" as const, quality: 85 },
      default: { maxEdge: 2048, fit: "inside" as const, quality: 85 },
      email: {
        maxEdge: 1200,
        fit: "inside" as const,
        quality: 90,
        keepFormat: true,
      },
    },
  },
} as const;

export type AppConfig = typeof app_config;
export type SurfaceName = keyof typeof app_config.surfaces;
