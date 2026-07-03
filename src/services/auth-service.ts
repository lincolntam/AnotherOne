import { clearSessionCookie, getSessionToken, setSessionCookie } from "@/lib/cookies";
import { createId, getDb, getEnv, normalizeEmail, nowIso } from "@/lib/d1";
import { randomToken, sha256, verifyPassword } from "@/lib/crypto";
import type { AppUser } from "@/types/app";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: "admin" | "user" | null;
  password_hash: string | null;
  created_at: string;
  active: number;
};

type SessionRow = {
  user_id: string;
  expires_at: string;
};

export async function loginWithPassword(email: string, password: string, remember: boolean) {
  const db = getDb();
  const row = await db
    .prepare("select * from ao_users_view where lower(email) = ? and active = 1 limit 1")
    .bind(normalizeEmail(email))
    .first<UserRow>();

  if (!row || !(await verifyPassword(password, row.password_hash, getPasswordSecret()))) {
    return { error: "Invalid email or password." };
  }

  const rawToken = randomToken();
  const tokenHash = await sha256(rawToken);
  const expires = new Date(Date.now() + (remember ? 7 : 1) * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare("insert into user_sessions (id, user_id, token_hash, expires_at, created_at) values (?, ?, ?, ?, ?)")
    .bind(createId("ses"), row.id, tokenHash, expires, nowIso())
    .run();

  await setSessionCookie(rawToken, remember);
  return { data: toAppUser(row) };
}

function getPasswordSecret() {
  const env = getEnv();
  return env.JWT_SECRET || env.LOGIN_SESSION_SECRET || "";
}

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;

  const db = getDb();
  const tokenHash = await sha256(token);
  const session = await db
    .prepare("select user_id, expires_at from user_sessions where token_hash = ? limit 1")
    .bind(tokenHash)
    .first<SessionRow>();

  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    await clearSessionCookie();
    return null;
  }

  const row = await db.prepare("select * from ao_users_view where id = ? and active = 1 limit 1").bind(session.user_id).first<UserRow>();
  return row ? toAppUser(row) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Response("Forbidden", { status: 403 });
  return user;
}

export async function logout() {
  const token = await getSessionToken();
  if (token) {
    const db = getDb();
    await db.prepare("delete from user_sessions where token_hash = ?").bind(await sha256(token)).run();
  }
  await clearSessionCookie();
}

export async function changePassword(userId: string, passwordHash: string) {
  const db = getDb();
  try {
    await db.prepare("update users set password_hash = ? where id = ?").bind(passwordHash, userId).run();
  } catch {
    await db.prepare("update users set password = ? where cast(id as text) = ?").bind(passwordHash, userId).run();
  }
}

function toAppUser(row: UserRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email.split("@")[0],
    avatarUrl: row.avatar_url,
    role: row.role === "admin" ? "admin" : "user",
    createdAt: row.created_at,
    active: Boolean(row.active)
  };
}
