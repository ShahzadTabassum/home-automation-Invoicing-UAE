// Shared HMAC signing helpers using the Web Crypto API so this code works
// identically in both the Edge middleware runtime and normal Node.js API routes.

export const SESSION_COOKIE_NAME = "hafze_session";

function getSecret() {
  return process.env.APP_PASSWORD || "changeme";
}

async function getKey(secret) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sign(value, secret = getSecret()) {
  const key = await getKey(secret);
  const encoder = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bufferToHex(sig);
}

export async function createSessionToken() {
  const payload = "authenticated";
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function isValidSessionToken(token, secret = getSecret()) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expectedSig = await sign(payload, secret);
  return expectedSig === sig;
}
