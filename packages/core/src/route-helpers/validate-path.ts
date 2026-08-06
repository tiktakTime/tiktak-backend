export function isValidStoragePath(path: string): boolean {
  const decoded = decodeURIComponent(path);
  if (decoded.includes("..")) return false;
  if (decoded.startsWith("/")) return false;
  if (decoded.includes("//")) return false;
  if (!/^[a-zA-Z0-9/._\-\u0080-\uFFFF() ]+$/.test(decoded)) return false;
  return true;
}
