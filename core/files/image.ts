import { fileTypeFromBuffer } from "file-type";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";

import { app_config } from "@/app.config";

const require = createRequire(import.meta.url);
const convertHeic = require("heic-convert") as (opts: {
  buffer: Buffer;
  format: "JPEG" | "PNG";
  quality: number;
}) => Promise<ArrayBuffer>;

export type ImageProfileName = keyof typeof app_config.files.image_profiles;

type CoverProfile = {
  width: number;
  height: number;
  fit: "cover";
  quality: number;
};

type InsideProfile = {
  maxEdge: number;
  fit: "inside";
  quality: number;
  keepFormat?: boolean;
};

type ImageProfile = CoverProfile | InsideProfile;

/**
 * Cast değil **atama**: `app.config`’teki bir profil bu şekle uymazsa
 * (ör. `fit: "contain"`) burada derleme hatası verir.
 */
const PROFILES: Record<ImageProfileName, ImageProfile> =
  app_config.files.image_profiles;

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".svg",
]);
const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  size: number;
  name: string;
}

export function normalizeProfile(profile?: string | null): ImageProfileName {
  if (profile && profile in PROFILES) {
    return profile as ImageProfileName;
  }
  return "default";
}

export function isImageFile(originalname?: string, mimetype?: string): boolean {
  const ext = path.extname((originalname || "").toLowerCase());
  if (IMAGE_EXTENSIONS.has(ext)) return true;
  if (mimetype?.startsWith("image/")) return true;
  return false;
}

function toFileNameWithExt(originalname: string, ext: string): string {
  const base = path.basename(
    originalname || "image",
    path.extname(originalname || ""),
  );
  return `${base}${ext}`;
}

async function isHeicBuffer(buffer: Buffer, ext: string): Promise<boolean> {
  if (HEIC_EXTENSIONS.has(ext)) return true;
  try {
    const ft = await fileTypeFromBuffer(buffer);
    return (
      !!ft &&
      (ft.ext === "heic" ||
        ft.ext === "heif" ||
        ft.mime === "image/heic" ||
        ft.mime === "image/heif")
    );
  } catch {
    return false;
  }
}

async function decodeHeic(buffer: Buffer): Promise<Buffer> {
  const output = await convertHeic({
    buffer,
    format: "JPEG",
    quality: 1,
  });
  return Buffer.from(output);
}

async function processAvatar(input: Buffer, profile: CoverProfile) {
  return sharp(input)
    .rotate()
    .resize(profile.width, profile.height, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: profile.quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });
}

/**
 * Profil tablosu `app.config` — HEIC → JPEG decode, çıktı genelde WebP
 * (`keepFormat` kaynak formatı korur).
 */
export async function processImage(
  buffer: Buffer,
  originalname: string,
  profileName: string = "default",
): Promise<ProcessedImage> {
  const profile = PROFILES[normalizeProfile(profileName)];
  const ext = path.extname((originalname || "").toLowerCase());

  let input = buffer;
  if (await isHeicBuffer(buffer, ext)) {
    input = await decodeHeic(buffer);
  }

  let output: Awaited<ReturnType<typeof processAvatar>>;
  let mimeType = "image/webp";
  let extension = ".webp";

  if (profile.fit === "cover") {
    output = await processAvatar(input, profile);
  } else {
    const pipeline = sharp(input)
      .rotate()
      .resize(profile.maxEdge, profile.maxEdge, {
        fit: "inside",
        withoutEnlargement: true,
      });

    if (profile.keepFormat) {
      const meta = await sharp(input).metadata();
      const isJpeg = meta.format === "jpeg";
      mimeType = isJpeg ? "image/jpeg" : "image/png";
      extension = isJpeg ? ".jpg" : ".png";
      output = await (
        isJpeg ? pipeline.jpeg({ quality: profile.quality }) : pipeline.png()
      ).toBuffer({ resolveWithObject: true });
    } else {
      output = await pipeline
        .webp({ quality: profile.quality, effort: 4 })
        .toBuffer({ resolveWithObject: true });
    }
  }

  return {
    buffer: output.data,
    mimeType,
    extension,
    width: output.info.width,
    height: output.info.height,
    size: output.info.size,
    name: toFileNameWithExt(originalname, extension),
  };
}

const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_TRIGGER = 1000;

/** Geniş görseller için küçük önizleme. */
export async function createThumbnail(
  buffer: Buffer,
  mimeType: string,
): Promise<{ data: Buffer; width: number; height: number } | null> {
  if (mimeType === "image/svg+xml") return null;

  const meta = await sharp(buffer).metadata();
  if ((meta.width ?? 0) <= THUMBNAIL_TRIGGER) return null;

  const format = mimeTypeToSharpFormat(mimeType);
  let pipeline = sharp(buffer).resize(THUMBNAIL_WIDTH, undefined, {
    fit: "inside",
    withoutEnlargement: true,
  });

  if (format) {
    pipeline = pipeline.toFormat(format, { quality: 70 });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function mimeTypeToSharpFormat(
  mimeType: string,
): "jpeg" | "png" | "webp" | undefined {
  switch (mimeType) {
    case "image/jpeg":
      return "jpeg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return undefined;
  }
}
