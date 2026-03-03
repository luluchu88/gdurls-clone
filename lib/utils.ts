import crypto from "crypto";

/**
 * Generate a short alphanumeric code
 */
export function makeCode(len = 7): string {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const bytes = crypto.randomBytes(len);
  let out = "";

  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }

  return out;
}

/**
 * Basic URL validation
 */
export function isProbablyValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim() ?? null;
  }

  return headers.get("x-real-ip");
}

/**
 * Hash IP for privacy-safe storage
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;

  const salt = process.env.GDURLS_SALT || "";

  return crypto
    .createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}

/**
 * Extract Google Drive file ID from common Drive URL formats
 */
export function extractDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);

    // Format: /file/d/<ID>/
    const m1 = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1?.[1]) return m1[1];

    // Format: /drive/folders/<ID>
    const m2 = u.pathname.match(/\/drive\/folders\/([a-zA-Z0-9_-]+)/);
    if (m2?.[1]) return m2[1];

    // Format: open?id=<ID>
    const idParam = u.searchParams.get("id");
    if (idParam) return idParam;

    return null;
  } catch {
    return null;
  }
}