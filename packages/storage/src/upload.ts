import { fileTypeFromBuffer } from "file-type";
import isSvg from "is-svg";

export async function validateMagicBytes(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<boolean> {
  if (mimeType === "image/svg+xml") {
    const text = new TextDecoder().decode(new Uint8Array(buffer, 0, 4096));
    return isSvg(text);
  }

  const type = await fileTypeFromBuffer(buffer);
  return type?.mime === mimeType;
}
