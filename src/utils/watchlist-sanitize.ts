import type { WatchlistGenre, WatchlistItem, WatchlistPerson } from "@/types/watchlist";

type WatchlistLink = WatchlistPerson | WatchlistGenre;

const junkPattern =
  /(?:ranking|login|sign|vip|search|english|malayu|deutsch|francais|fran.?ais|tieng viet|bahasa indonesia|filipino|portugues|telegram|vpn|official|menu)/iu;

export function normalizeWatchlistItem(item: WatchlistItem): WatchlistItem {
  return {
    ...item,
    id: cleanText(item.id),
    sourceUrl: cleanText(item.sourceUrl),
    site: item.site === "missav" || item.site === "jable" ? item.site : "unknown",
    title: cleanText(item.title || item.code || item.sourceUrl),
    code: normalizeCode(item.code),
    coverUrl: cleanText(item.coverUrl),
    previewUrl: cleanText(item.previewUrl || ""),
    actresses: sanitizePeople(item.actresses),
    genres: sanitizeGenres(item.genres),
    releaseDate: cleanReleaseDate(item.releaseDate),
    savedAt: cleanText(item.savedAt)
  };
}

export function sanitizePeople(items?: WatchlistPerson[]) {
  return sanitizeLinks(items, { requiredPath: "/actresses/", maxItems: 10 });
}

export function sanitizeGenres(items?: WatchlistGenre[]) {
  return sanitizeLinks(items, { requiredPath: "/genres/", maxItems: 24 });
}

export function cleanReleaseDate(value: string) {
  const cleaned = cleanText(value);
  const match = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/u.exec(cleaned);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

export function isDirtyWatchlistItem(item: WatchlistItem) {
  return hasJunkLinks(item.actresses) || hasJunkLinks(item.genres) || item.actresses.length > 10 || item.genres.length > 24;
}

export function cleanText(value: string) {
  return String(value || "").replace(/\s+/gu, " ").trim();
}

export function normalizeCode(value: string) {
  return cleanText(value).replace(/[_\s]+/gu, "-").toUpperCase();
}

function sanitizeLinks<T extends WatchlistLink>(items: T[] | undefined, options: { requiredPath: string; maxItems: number }) {
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  const cleanItems = items
    .map((item) => ({
      name: cleanText(item.name),
      url: cleanUrl(item.url || "") || undefined
    }))
    .filter((item) => {
      if (!item.name || item.name.length > 42 || junkPattern.test(item.name)) return false;
      if (item.url && !urlContainsPath(item.url, options.requiredPath)) return false;

      const key = `${item.name.toLowerCase()}|${item.url || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return cleanItems.slice(0, options.maxItems) as T[];
}

function hasJunkLinks(items: WatchlistLink[]) {
  return items.some((item) => junkPattern.test(item.name));
}

function cleanUrl(value: string) {
  const trimmed = cleanText(value);
  if (!trimmed) return "";
  try {
    return new URL(trimmed).href;
  } catch {
    return trimmed;
  }
}

function urlContainsPath(value: string, path: string) {
  try {
    return new URL(value).pathname.toLowerCase().includes(path);
  } catch {
    return value.toLowerCase().includes(path);
  }
}
