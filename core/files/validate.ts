import { fileTypeFromBuffer } from "file-type";
import isSvg from "is-svg";

import { app_config } from "@/app.config";

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.slice(dot).toLowerCase();
}

export function isAllowedExtension(filename: string): boolean {
  const ext = extensionOf(filename);
  return (app_config.files.allowed_extensions as readonly string[]).includes(
    ext,
  );
}

export async function validateMagicBytes(
  buffer: ArrayBuffer | Buffer | Uint8Array,
  mimeType: string,
): Promise<boolean> {
  if (mimeType === "image/svg+xml") {
    const view =
      buffer instanceof ArrayBuffer
        ? new Uint8Array(buffer, 0, Math.min(4096, buffer.byteLength))
        : buffer.subarray(0, Math.min(4096, buffer.byteLength));
    return isSvg(new TextDecoder().decode(view));
  }

  const type = await fileTypeFromBuffer(buffer);
  return type?.mime === mimeType;
}

export function assertFileWithinSize(size: number, maxBytes: number): boolean {
  return size > 0 && size <= maxBytes;
}
