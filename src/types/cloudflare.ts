/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    APP_DB?: D1Database;
    NEXT_PUBLIC_APP_NAME?: string;
    SESSION_COOKIE_NAME?: string;
    SESSION_TTL_DAYS?: string;
    JWT_SECRET?: string;
    LOGIN_SESSION_SECRET?: string;
  }
}

export {};
