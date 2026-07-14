// Uses the Web Crypto API only (globalThis.crypto) so this file works in both
// the Next.js Edge middleware runtime and the Node.js API route runtime.

export const SESSION_COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 8) return secret;
  // Fallback for local/dev only. Always set SESSION_SECRET in production (Render env vars).
  return "dev-only-insecure-secret-change-me";
}

function bufToBase64Url(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuf(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  // Returned as a Uint8Array (not .buffer): crypto.subtle's instanceof checks on a
  // bare ArrayBuffer can fail across the Edge middleware sandbox / Node realm boundary.
  return bytes;
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const encodedPayload = bufToBase64Url(new TextEncoder().encode(payload));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  return `${encodedPayload}.${bufToBase64Url(sig)}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [encodedPayload, encodedSig] = token.split(".");
  if (!encodedPayload || !encodedSig) return false;
  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBuf(encodedSig),
      new TextEncoder().encode(encodedPayload)
    );
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBuf(encodedPayload)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

async function sha256Base64Url(str) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return bufToBase64Url(digest);
}

export async function checkPassword(candidate) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return false; // Fail closed if no password is configured.
  const a = await sha256Base64Url(String(candidate || ""));
  const b = await sha256Base64Url(String(configured));
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS
};
