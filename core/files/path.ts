/** Starter / lemonerce tarzı thumbnail yolu. */
export function thumbnailPath(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return `${filePath}-thumbnail`;
  return `${filePath.slice(0, dot)}-thumbnail${filePath.slice(dot)}`;
}
