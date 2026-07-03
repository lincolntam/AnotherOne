import { getCloudflareContext } from "@opennextjs/cloudflare";
import "@/types/cloudflare";

export function getDb() {
  const context = getCloudflareContext();
  if (!context.env.DB) {
    throw new Error("Cloudflare D1 binding DB is not configured.");
  }
  return context.env.DB;
}

export function getEnv() {
  return getCloudflareContext().env;
}

export function nowIso() {
  return new Date().toISOString();
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}
