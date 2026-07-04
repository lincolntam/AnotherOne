import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";
import { requireUser } from "@/services/auth-service";
import type { WatchlistGenre, WatchlistItem, WatchlistPerson } from "@/types/watchlist";

const allowedHosts = ["missav.ws", "jable.tv", "fourhoi.com"];

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
        return NextResponse.json({ data: fallback });
      }

      const html = await response.text();
      const title = cleanText(extractMeta(html, "og:title") || extractTag(html, "h1") || extractTitle(html) || fallback.title);
      const coverUrl = absolutize(extractCoverImage(html) || extractMeta(html, "og:image") || extractLinkImage(html) || "", parsed);
      const code = extractCode(`${parsed.pathname} ${title}`) || fallback.code;
      const labelActresses = extractLabelLinks<WatchlistPerson>(html, "女優", parsed);
      const labelGenres = extractLabelLinks<WatchlistGenre>(html, "類型", parsed);

      const item: WatchlistItem = {
        id: createId(code, parsed.href),
        sourceUrl: parsed.href,
        site,
        title,
        code,
        coverUrl,
        previewUrl: absolutize(extractMeta(html, "og:video") || extractMeta(html, "og:video:url") || extractMeta(html, "og:video:secure_url") || "", parsed),
        actresses: uniqueByName(labelActresses.length ? labelActresses : extractLinkedLabels(html, /href=["']([^"']*\/actresses\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/giu, parsed)),
        genres: uniqueByName(labelGenres.length ? labelGenres : extractLinkedLabels(html, /href=["']([^"']*\/genres\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/giu, parsed)),
        releaseDate: extractReleaseDate(html),
        savedAt: new Date().toISOString()
      };

      return NextResponse.json({ data: item });
    } catch {
      return NextResponse.json({ data: fallback });
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
  const code = extractCode(sourceUrl);
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
    savedAt: new Date().toISOString()
  };
}

function createId(code: string, sourceUrl: string) {
  return (code || sourceUrl).toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "") || crypto.randomUUID();
}

function extractMeta(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
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

function extractReleaseDate(html: string) {
  const labelledText = extractLabelText(html, "發行日期");
  const labelled = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/u.exec(labelledText)?.[1];
  const normalized = stripTags(html).replace(/\s+/gu, " ");
  const englishLabelled = /release date\s*[:：]?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/iu.exec(normalized)?.[1];
  const fallback = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/u.exec(normalized)?.[1];
  return (labelled || englishLabelled || fallback || "").replace(/\//gu, "-");
}

function extractLinkedLabels<T extends WatchlistPerson | WatchlistGenre>(html: string, pattern: RegExp, baseUrl: URL): T[] {
  const items: T[] = [];
  for (const match of html.matchAll(pattern)) {
    const name = cleanText(decodeHtml(match[2] || ""));
    if (!name) continue;
    items.push({ name, url: absolutize(decodeHtml(match[1] || ""), baseUrl) } as T);
  }
  return items;
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

  return extractDelimitedNames(stripTags(segment)).map((name) => ({ name }) as T);
}

function extractLabelText(html: string, label: string) {
  return cleanText(decodeHtml(stripTags(extractLabelSegment(html, label))));
}

function extractLabelSegment(html: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(`<span[^>]*>\\s*${escaped}\\s*[:：]?\\s*<\\/span>([\\s\\S]*?)(?=<span[^>]*>|<\\/div>|<\\/p>|<\\/li>|<br\\s*\\/?>|$)`, "iu");
  return pattern.exec(html)?.[1] || "";
}

function extractDelimitedNames(value: string) {
  return cleanText(value)
    .replace(/^\s*[:：]\s*/u, "")
    .split(/[,，、]/u)
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

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gu, "&")
    .replace(/&quot;/gu, "\"")
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&nbsp;/gu, " ");
}
