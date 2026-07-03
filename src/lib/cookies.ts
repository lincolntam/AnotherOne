import { cookies } from "next/headers";

export const sessionCookieName = () => process.env.SESSION_COOKIE_NAME || "ao_session";

export async function getSessionToken() {
  const jar = await cookies();
  return jar.get(sessionCookieName())?.value ?? null;
}

export async function setSessionCookie(token: string, remember: boolean) {
  const jar = await cookies();
  const days = Number(process.env.SESSION_TTL_DAYS || "7");
  jar.set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? days * 24 * 60 * 60 : undefined
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(sessionCookieName());
}
