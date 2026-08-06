export const ALLOWED_IMAGE_EXTENSIONS: string[] = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
];
export const ALLOWED_MIME_TYPES: string[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

export const MAX_FILES = 10;

export const MAX_FILE_SIZE_BY_MIME: Record<string, number> = {
  "image/png": 3 * 1024 * 1024, // 3 MB
  "image/jpeg": 1.5 * 1024 * 1024, // 1.5 MB
  "image/webp": 1.5 * 1024 * 1024, // 1.5 MB
  "image/svg+xml": 512 * 1024, // 0.5 MB
};
