import { createId, getAppDb, nowIso } from "@/lib/d1";
import type { AppUser } from "@/types/app";
import type { WatchlistGenre, WatchlistItem, WatchlistPerson } from "@/types/watchlist";

type WatchlistRow = {
  id: string;
  source_url: string;
  site: WatchlistItem["site"];
  title: string;
  code: string;
  cover_url: string;
  preview_url: string;
  actresses_json: string;
  genres_json: string;
  release_date: string;
  saved_at: string;
};

export async function listWatchlistItems(user: AppUser) {
  const rows = await getAppDb()
    .prepare(
      `select id, source_url, site, title, code, cover_url, preview_url, actresses_json, genres_json, release_date, saved_at
       from anotherwm_watchlist_items
       where user_id = ?
       order by saved_at desc`
    )
    .bind(user.id)
    .all<WatchlistRow>();

  return (rows.results || []).map(toWatchlistItem);
}

export async function saveWatchlistItem(user: AppUser, item: WatchlistItem) {
  const normalized = normalizeWatchlistItem(item);
  const id = normalized.id || createId("awm");
  const savedAt = normalized.savedAt || nowIso();

  await getAppDb()
    .prepare(
      `insert into anotherwm_watchlist_items
        (id, user_id, source_url, site, title, code, cover_url, preview_url, actresses_json, genres_json, release_date, saved_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       on conflict(user_id, source_url) do update set
        site = excluded.site,
        title = excluded.title,
        code = excluded.code,
        cover_url = excluded.cover_url,
        preview_url = excluded.preview_url,
        actresses_json = excluded.actresses_json,
        genres_json = excluded.genres_json,
        release_date = excluded.release_date,
        updated_at = excluded.updated_at`
    )
    .bind(
      id,
      user.id,
      normalized.sourceUrl,
      normalized.site,
      normalized.title,
      normalized.code,
      normalized.coverUrl,
      normalized.previewUrl || "",
      JSON.stringify(normalized.actresses),
      JSON.stringify(normalized.genres),
      normalized.releaseDate,
      savedAt,
      nowIso()
    )
    .run();

  return { ...normalized, id, savedAt };
}

function normalizeWatchlistItem(item: WatchlistItem): WatchlistItem {
  return {
    id: cleanText(item.id),
    sourceUrl: cleanText(item.sourceUrl),
    site: item.site === "missav" || item.site === "jable" ? item.site : "unknown",
    title: cleanText(item.title || item.code || item.sourceUrl),
    code: cleanText(item.code),
    coverUrl: cleanText(item.coverUrl),
    previewUrl: cleanText(item.previewUrl || ""),
    actresses: normalizeLinks(item.actresses),
    genres: normalizeLinks(item.genres),
    releaseDate: cleanText(item.releaseDate),
    savedAt: cleanText(item.savedAt || nowIso())
  };
}

function toWatchlistItem(row: WatchlistRow): WatchlistItem {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    site: row.site,
    title: row.title,
    code: row.code,
    coverUrl: row.cover_url,
    previewUrl: row.preview_url,
    actresses: parseLinks<WatchlistPerson>(row.actresses_json),
    genres: parseLinks<WatchlistGenre>(row.genres_json),
    releaseDate: row.release_date,
    savedAt: row.saved_at
  };
}

function parseLinks<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeLinks<T extends { name: string; url?: string }>(items: T[]) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({ name: cleanText(item.name), url: cleanText(item.url || "") || undefined })).filter((item) => item.name);
}

function cleanText(value: string) {
  return String(value || "").replace(/\s+/gu, " ").trim();
}
