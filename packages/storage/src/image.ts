import sharp from "sharp";

export interface ProcessedImage {
  data: Buffer;
  width: number;
  height: number;
  size: number;
  thumbnail: { data: Buffer; width: number; height: number } | null;
}

const MAX_DIMENSION = 2500;
const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_TRIGGER = 1000;

const JPEG_QUALITY = 90;
const WEBP_QUALITY = 90;

export async function processImage(
  buffer: Buffer,
  mimeType: string,
): Promise<ProcessedImage> {
  if (mimeType === "image/svg+xml") {
    return {
      data: buffer,
      width: 0,
      height: 0,
      size: buffer.length,
      thumbnail: null,
    };
  }

  let pipeline = sharp(buffer);
  const metadata = await pipeline.metadata();
  const originalWidth = metadata.width ?? 0;

  const needsResize = originalWidth > MAX_DIMENSION;

  if (needsResize) {
    pipeline = pipeline.resize(MAX_DIMENSION, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const format = mimeTypeToSharpFormat(mimeType);
  if (format) {
    pipeline = pipeline.toFormat(format, getFormatOptions(format));
  }

  const { data: optimized, info: optInfo } = await pipeline.toBuffer({
    resolveWithObject: true,
  });

  let thumbnail: ProcessedImage["thumbnail"] = null;
  if (originalWidth > THUMBNAIL_TRIGGER) {
    let thumbPipeline = sharp(optimized).resize(THUMBNAIL_WIDTH, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    });

    if (format) {
      thumbPipeline = thumbPipeline.toFormat(format, {
        ...getFormatOptions(format),
        quality: 70,
      });
    }

    const { data: thumbBuffer, info: thumbInfo } = await thumbPipeline.toBuffer(
      { resolveWithObject: true },
    );

    thumbnail = {
      data: thumbBuffer,
      width: thumbInfo.width,
      height: thumbInfo.height,
    };
  }

  return {
    data: optimized,
    width: optInfo.width,
    height: optInfo.height,
    size: optimized.length,
    thumbnail,
  };
}

export function thumbnailPath(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return `${filePath}-thumbnail`;
  return `${filePath.slice(0, dot)}-thumbnail${filePath.slice(dot)}`;
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

function getFormatOptions(format: "jpeg" | "png" | "webp") {
  switch (format) {
    case "jpeg":
      return { quality: JPEG_QUALITY, mozjpeg: true };
    case "png":
      return { compressionLevel: 9, palette: true };
    case "webp":
      return { quality: WEBP_QUALITY };
  }
}
