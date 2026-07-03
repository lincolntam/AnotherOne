const encoder = new TextEncoder();

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64Url(new Uint8Array(digest));
}

export async function verifyPassword(password: string, storedHash: string | null, passwordSecret = "") {
  if (!storedHash) return false;

  if (storedHash.startsWith("pbkdf2$")) {
    const [, algorithm, iterationsText, salt, expected] = storedHash.split("$");
    if (algorithm !== "sha256") return false;

    const iterations = Number(iterationsText);
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: base64UrlToBytes(salt), iterations },
      keyMaterial,
      256
    );

    return timingSafeEqual(base64Url(new Uint8Array(bits)), expected);
  }

  if (storedHash.startsWith("sha256$")) {
    const expected = storedHash.split("$")[1];
    return timingSafeEqual(await sha256(password), expected);
  }

  if (storedHash.startsWith("hmac-sha256$")) {
    const [, salt, expected] = storedHash.split("$");
    if (!salt || !expected) return false;
    if (passwordSecret.length >= 32) {
      return timingSafeEqual(await ltravelLogPasswordHmac(password, salt, passwordSecret), expected);
    }
    return false;
  }

  return false;
}

export async function createPasswordHash(password: string) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const iterations = 210000;
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256
  );

  return `pbkdf2$sha256$${iterations}$${base64Url(salt)}$${base64Url(new Uint8Array(bits))}`;
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function ltravelLogPasswordHmac(password: string, salt: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${salt}.${password}`));
  return base64Url(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
