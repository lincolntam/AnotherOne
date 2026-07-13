import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireUser } from "@/services/auth-service";
import type { WatchlistGenre, WatchlistItem, WatchlistPerson } from "@/types/watchlist";

const actressLabel = "\u5973\u512a";
const genreLabel = "\u985e\u578b";
const releaseDateLabel = "\u767c\u884c\u65e5\u671f";
const allowedHosts = ["missav.ws", "missav.live", "jable.tv", "fourhoi.com"];

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const sourceUrl = body.url?.trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    const parsed = parseAllowedUrl(sourceUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Only MissAV, Jable and Fourhoi URLs are supported." }, { status: 400 });
    }

    const site = getSite(parsed.hostname);
    const fallback = createFallbackItem(parsed.href, site);

    try {
      const response = await fetch(parsed.href, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "AnotherOne/1.0 (+https://anotherone.local)"
        },
        redirect: "follow"
      });

      if (!response.ok) {
        return NextResponse.json({ data: enrichFallbackCover(fallback) });
      }

      const html = await response.text();
      const title = cleanText(extractMeta(html, "og:title") || extractTag(html, "h1") || extractTitle(html) || fallback.title);
      const code = preferPaddedCode(extractCodeFromUrlPath(parsed.href), extractCode(`${parsed.pathname} ${title}`) || fallback.code);
      const item: WatchlistItem = {
        id: createId(code, parsed.href),
        sourceUrl: parsed.href,
        site,
        title,
        code,
        coverUrl: absolutize(extractCoverImage(html) || extractMeta(html, "og:image") || extractLinkImage(html) || fallbackCoverUrl(code), parsed),
        previewUrl: absolutize(extractMeta(html, "og:video") || extractMeta(html, "og:video:url") || extractMeta(html, "og:video:secure_url") || "", parsed),
        actresses: uniqueByName(extractLabelLinks<WatchlistPerson>(html, actressLabel, parsed)),
        genres: uniqueByName(extractLabelLinks<WatchlistGenre>(html, genreLabel, parsed)),
        releaseDate: extractReleaseDate(html),
        status: "Pending",
        statuses: ["Pending"],
        savedAt: new Date().toISOString()
      };

      return NextResponse.json({ data: await enrichMissingMetadata(item, parsed.href) });
    } catch {
      return NextResponse.json({ data: enrichFallbackCover(fallback) });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

function parseAllowedUrl(value: string) {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./u, "");
    if (!allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getSite(hostname: string): WatchlistItem["site"] {
  if (hostname.includes("jable")) return "jable";
  if (hostname.includes("missav")) return "missav";
  return "unknown";
}

function createFallbackItem(sourceUrl: string, site: WatchlistItem["site"]): WatchlistItem {
  const code = preferPaddedCode(extractCodeFromUrlPath(sourceUrl), extractCode(sourceUrl));
  return {
    id: createId(code, sourceUrl),
    sourceUrl,
    site,
    title: code || sourceUrl,
    code,
    coverUrl: "",
    actresses: [],
    genres: [],
    releaseDate: "",
    status: "Pending",
    statuses: ["Pending"],
    savedAt: new Date().toISOString()
  };
}

function enrichFallbackCover(item: WatchlistItem): WatchlistItem {
  if (item.coverUrl || !item.code) return item;
  return { ...item, coverUrl: fallbackCoverUrl(item.code) };
}

function fallbackCoverUrl(code: string) {
  return code ? `https://fourhoi.com/${code.toLowerCase()}/cover-n.jpg` : "";
}

async function enrichMissingMetadata(item: WatchlistItem, currentUrl: string): Promise<WatchlistItem> {
  if (hasCoreMetadata(item) || !item.code) return item;

  for (const url of metadataCandidateUrls(item.code, currentUrl)) {
    const parsed = parseAllowedUrl(url);
    if (!parsed) continue;

    const extra = await fetchMetadataCandidate(parsed, item).catch(() => null);
    if (!extra) continue;

    const merged: WatchlistItem = {
      ...item,
      site: item.site === "unknown" ? extra.site : item.site,
      title: item.title === item.code && extra.title ? extra.title : item.title,
      actresses: item.actresses.length ? item.actresses : extra.actresses,
      genres: item.genres.length ? item.genres : extra.genres,
      releaseDate: item.releaseDate || extra.releaseDate,
      previewUrl: item.previewUrl || extra.previewUrl,
      status: item.status || extra.status,
      statuses: item.statuses?.length ? item.statuses : extra.statuses
    };

    if (hasCoreMetadata(merged)) return merged;
  }

  return item;
}

function hasCoreMetadata(item: WatchlistItem) {
  return Boolean(item.releaseDate && item.genres.length && !hasRankingActress(item));
}

function hasRankingActress(item: WatchlistItem) {
  return item.actresses.some((person) => /ranking|\u6392\u884c/iu.test(`${person.name} ${person.url || ""}`));
}

function metadataCandidateUrls(code: string, currentUrl: string) {
  const slug = code.toLowerCase();
  return [`https://missav.live/${slug}`, `https://missav.ws/${slug}`].filter((url) => url !== currentUrl);
}

async function fetchMetadataCandidate(parsed: URL, fallback: WatchlistItem): Promise<WatchlistItem | null> {
  const response = await fetch(parsed.href, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "AnotherOne/1.0 (+https://anotherone.local)"
    },
    redirect: "follow"
  });

  if (!response.ok) return null;

  const html = await response.text();
  const title = cleanText(extractMeta(html, "og:title") || extractTag(html, "h1") || extractTitle(html) || fallback.title);
  const code = preferPaddedCode(extractCodeFromUrlPath(parsed.href), extractCode(`${parsed.pathname} ${title}`) || fallback.code);

  return {
    ...fallback,
    id: createId(code, fallback.sourceUrl),
    site: getSite(parsed.hostname),
    title,
    code,
    previewUrl: absolutize(extractMeta(html, "og:video") || extractMeta(html, "og:video:url") || extractMeta(html, "og:video:secure_url") || "", parsed),
    actresses: uniqueByName(extractLabelLinks<WatchlistPerson>(html, actressLabel, parsed)).filter((person) => !/ranking|\u6392\u884c/iu.test(`${person.name} ${person.url || ""}`)),
    genres: uniqueByName(extractLabelLinks<WatchlistGenre>(html, genreLabel, parsed)),
    releaseDate: extractReleaseDate(html)
  };
}

function createId(code: string, sourceUrl: string) {
  return (code || sourceUrl).toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "") || crypto.randomUUID();
}

function extractMeta(html: string, property: string) {
  const escaped = escapeRegExp(property);
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "iu");
  return decodeHtml(pattern.exec(html)?.[1] || "");
}

function extractTitle(html: string) {
  return decodeHtml(/<title[^>]*>([\s\S]*?)<\/title>/iu.exec(html)?.[1] || "");
}

function extractTag(html: string, tag: string) {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "iu");
  return decodeHtml(pattern.exec(html)?.[1] || "");
}

function extractLinkImage(html: string) {
  return decodeHtml(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/iu.exec(html)?.[1] || "");
}

function extractCoverImage(html: string) {
  const candidates = [
    ...findAttributeValues(html, "img", "src"),
    ...findAttributeValues(html, "img", "data-src"),
    ...findAttributeValues(html, "source", "src"),
    ...findAttributeValues(html, "source", "data-src")
  ].map(decodeHtml);

  return candidates.find((value) => /cover[^"'?\s]*\.(?:jpe?g|png|webp)/iu.test(value)) || candidates.find((value) => /\.(?:jpe?g|png|webp)(?:\?|$)/iu.test(value)) || "";
}

function extractCode(value: string) {
  const match = /([a-z]{2,8})[-_ ]?(\d{2,6})/iu.exec(value);
  return match ? `${match[1].toUpperCase()}-${match[2]}` : "";
}

function extractCodeFromUrlPath(value: string) {
  try {
    const parts = new URL(value).pathname.split("/").filter(Boolean).reverse();
    for (const part of parts) {
      const match = /^([a-z]{2,8})[-_ ]?(\d{2,6})$/iu.exec(part);
      if (match) return `${match[1].toUpperCase()}-${match[2]}`;
    }
  } catch {
    // Keep the generic parser as the fallback for non-URL strings.
  }
  return "";
}

function preferPaddedCode(urlCode: string, parsedCode: string) {
  const urlMatch = /^([A-Z]{2,8})-(\d{2,6})$/u.exec(urlCode);
  const parsedMatch = /^([A-Z]{2,8})-(\d{2,6})$/u.exec(parsedCode);

  if (urlMatch && parsedMatch && urlMatch[1] === parsedMatch[1] && Number(urlMatch[2]) === Number(parsedMatch[2]) && urlMatch[2].length > parsedMatch[2].length) {
    return urlCode;
  }

  return parsedCode || urlCode;
}

function extractReleaseDate(html: string) {
  const labelledText = extractLabelText(html, releaseDateLabel);
  const labelled = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/u.exec(labelledText)?.[1];
  const normalized = stripTags(html).replace(/\s+/gu, " ");
  const englishLabelled = /release date\s*[:\uFF1A]?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/iu.exec(normalized)?.[1];
  const fallback = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/u.exec(normalized)?.[1];
  return (labelled || englishLabelled || fallback || "").replace(/\//gu, "-");
}

function extractLabelLinks<T extends WatchlistPerson | WatchlistGenre>(html: string, label: string, baseUrl: URL): T[] {
  const segment = extractLabelSegment(html, label);
  if (!segment) return [];

  const linkedItems: T[] = [];
  for (const match of segment.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/giu)) {
    const name = cleanText(decodeHtml(match[2] || ""));
    if (!name) continue;
    linkedItems.push({ name, url: absolutize(decodeHtml(match[1] || ""), baseUrl) } as T);
  }

  if (linkedItems.length) return linkedItems;

  return extractDelimitedNames(stripTags(removeLabel(segment, label))).map((name) => ({ name }) as T);
}

function extractLabelText(html: string, label: string) {
  return cleanText(decodeHtml(stripTags(removeLabel(extractLabelSegment(html, label), label))));
}

function extractLabelSegment(html: string, label: string) {
  const labelPattern = createLabelPattern(label);
  const match = labelPattern.exec(html);
  if (!match || match.index < 0) return "";

  const labelIndex = match.index;
  const divStart = html.lastIndexOf("<div", labelIndex);
  const blockStart = divStart >= 0 ? divStart : labelIndex;
  const divEnd = html.indexOf("</div>", labelIndex);
  const blockEnd = divEnd >= 0 ? divEnd + "</div>".length : findNextKnownLabelIndex(html, labelIndex + match[0].length);
  return html.slice(blockStart, blockEnd > blockStart ? blockEnd : html.length);
}

function createLabelPattern(label: string) {
  return new RegExp(`(?:<span[^>]*>\\s*)?${escapeRegExp(label)}\\s*[:\\uFF1A]`, "iu");
}

function findNextKnownLabelIndex(html: string, fromIndex: number) {
  const labels = [actressLabel, genreLabel, releaseDateLabel, "\u767c\u884c\u5546", "\u756a\u865f", "\u6a19\u7c64", "\u5c0e\u6f14"];
  const indexes = labels
    .map((label) => html.slice(fromIndex).search(createLabelPattern(label)))
    .filter((index) => index >= 0)
    .map((index) => fromIndex + index);
  return indexes.length ? Math.min(...indexes) : html.length;
}

function removeLabel(value: string, label: string) {
  return value.replace(createLabelPattern(label), "");
}

function extractDelimitedNames(value: string) {
  return cleanText(value)
    .replace(/^\s*[:\uFF1A]\s*/u, "")
    .split(/[,\uFF0C\u3001]/u)
    .map((name) => cleanText(name))
    .filter(Boolean);
}

function findAttributeValues(html: string, tagName: string, attributeName: string) {
  const values: string[] = [];
  const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, "giu");
  const attributePattern = new RegExp(`\\b${attributeName}=["']([^"']+)["']`, "iu");

  for (const match of html.matchAll(tagPattern)) {
    const value = attributePattern.exec(match[0])?.[1];
    if (value) values.push(value);
  }

  return values;
}

function uniqueByName<T extends { name: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function absolutize(value: string, baseUrl: URL) {
  if (!value) return "";
  try {
    return new URL(value, baseUrl.origin).href;
  } catch {
    return value;
  }
}

function stripTags(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/giu, " ").replace(/<style[\s\S]*?<\/style>/giu, " ").replace(/<[^>]+>/gu, " ");
}

function cleanText(value: string) {
  return stripTags(value).replace(/\s+/gu, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gu, "&")
    .replace(/&quot;/gu, "\"")
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&nbsp;/gu, " ");
}
