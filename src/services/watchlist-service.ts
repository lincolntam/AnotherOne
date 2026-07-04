import { createId, getAppDb, nowIso } from "@/lib/d1";
import type { AppUser } from "@/types/app";
import type { WatchlistGenre, WatchlistItem, WatchlistPerson } from "@/types/watchlist";
import { normalizeWatchlistItem as normalizeWatchlistPayload } from "@/utils/watchlist-sanitize";

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
  status: WatchlistItem["status"];
  saved_at: string;
};

let schemaReady = false;

export async function listWatchlistItems(user: AppUser) {
  await ensureWatchlistSchema();
  const rows = await getAppDb()
    .prepare(
      `select id, source_url, site, title, code, cover_url, preview_url, actresses_json, genres_json, release_date, status, saved_at
       from anotherwm_watchlist_items
       where user_id = ?
       order by saved_at desc`
    )
    .bind(user.id)
    .all<WatchlistRow>();

  return (rows.results || []).map(toWatchlistItem);
}

export async function saveWatchlistItem(user: AppUser, item: WatchlistItem) {
  await ensureWatchlistSchema();
  const normalized = normalizeWatchlistItem(item);
  const id = normalized.id || createId("awm");
  const savedAt = normalized.savedAt || nowIso();

  await getAppDb()
    .prepare(
      `insert into anotherwm_watchlist_items
        (id, user_id, source_url, site, title, code, cover_url, preview_url, actresses_json, genres_json, release_date, status, saved_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      on conflict(user_id, source_url) do update set
        id = excluded.id,
        site = excluded.site,
        title = excluded.title,
        code = excluded.code,
        cover_url = excluded.cover_url,
        preview_url = excluded.preview_url,
        actresses_json = excluded.actresses_json,
        genres_json = excluded.genres_json,
        release_date = excluded.release_date,
        status = excluded.status,
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
      normalized.status,
      savedAt,
      nowIso()
    )
    .run();

  return { ...normalized, id, savedAt };
}

export async function deleteWatchlistItem(user: AppUser, id: string) {
  await ensureWatchlistSchema();
  await getAppDb()
    .prepare(
      `delete from anotherwm_watchlist_items
       where user_id = ? and (id = ? or source_url = ?)`
    )
    .bind(user.id, id, id)
    .run();
  return { ok: true };
}

function normalizeWatchlistItem(item: WatchlistItem): WatchlistItem {
  return normalizeWatchlistPayload({ ...item, savedAt: item.savedAt || nowIso() });
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
    status: row.status === "Watched" || row.status === "Again" ? row.status : "Pending",
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

async function ensureWatchlistSchema() {
  if (schemaReady) return;
  await getAppDb()
    .prepare("alter table anotherwm_watchlist_items add column status text not null default 'Pending'")
    .run()
    .catch(() => undefined);
  schemaReady = true;
}
