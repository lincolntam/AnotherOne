"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { WatchlistGenre, WatchlistItem, WatchlistPerson } from "@/types/watchlist";
import { cleanReleaseDate, cleanText, normalizeCode, normalizeWatchlistItem, sanitizeGenres, sanitizePeople } from "@/utils/watchlist-sanitize";
import { upsertWatchlistItem } from "@/utils/watchlist-storage";

type ImportPayload = {
  url?: string;
  title?: string;
  cover?: string;
  coverUrl?: string;
  imageUrl?: string;
  description?: string;
  previewUrl?: string;
  site?: string;
  actresses?: WatchlistPerson[];
  genres?: WatchlistGenre[];
  releaseDate?: string;
  code?: string;
  rawText?: string;
  selectedText?: string;
};

const pendingImportKey = "anotherwm-pending-import";
const titleLabels = ["Title", "\u6a19\u984c"];
const actressLabels = ["Actress", "Actresses", "\u5973\u512a"];
const genreLabels = ["Genre", "Genres", "\u985e\u578b"];
const releaseDateLabels = ["Release date", "Release Date", "\u767c\u884c\u65e5\u671f"];
const codeLabels = ["Code", "\u756a\u865f"];
const allLabels = [...titleLabels, ...actressLabels, ...genreLabels, ...releaseDateLabels, ...codeLabels, "Series", "Maker", "Label", "Director", "\u7cfb\u5217", "\u767c\u884c\u5546", "\u6a19\u7c64", "\u5c0e\u6f14"];

export default function AnotherWMImportPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "saved" | "error">("loading");
  const [message, setMessage] = useState("Reading bookmark data...");

  useEffect(() => {
    const fromUrl = readImportDataFromUrl();
    if (fromUrl) {
      window.sessionStorage.setItem(pendingImportKey, fromUrl);
      if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
      window.sessionStorage.setItem("anotherone-secret-redirect", "/secret/anotherwm/import");
      router.replace("/passcode");
      return;
    }

    const raw = fromUrl || window.sessionStorage.getItem(pendingImportKey);
    if (!raw) {
      setStatus("error");
      setMessage("No import data found.");
      return;
    }

    try {
      const payload = parseImportPayload(raw);
      const item = createWatchlistItem(payload);
      api<WatchlistItem>("/api/secret/watchlist", {
        method: "POST",
        body: JSON.stringify(item)
      })
        .then((saved) => {
          upsertWatchlistItem(saved);
          window.sessionStorage.removeItem(pendingImportKey);
          setStatus("saved");
          setMessage("Saved to AnotherWM.");
          window.setTimeout(() => router.replace(`/secret/anotherwm/list/${encodeURIComponent(saved.id)}` as Route), 650);
        })
        .catch((error) => {
          if (error instanceof Error && error.message === "Unauthorized") {
            window.sessionStorage.setItem("anotherone-secret-redirect", "/secret/anotherwm/import");
            router.replace("/login?next=/secret/anotherwm/import");
            return;
          }

          upsertWatchlistItem(item);
          window.sessionStorage.removeItem(pendingImportKey);
          setStatus("saved");
          setMessage("Saved locally. Cloud sync is unavailable.");
          window.setTimeout(() => router.replace(`/secret/anotherwm/list/${encodeURIComponent(item.id)}` as Route), 650);
        });
    } catch {
      setStatus("error");
      setMessage("Import data is not valid.");
    }
  }, [router]);

  return (
    <AppShell showHeader={false} showBottomNav={false}>
      <main className="flex min-h-[680px] flex-col items-center justify-center px-8 text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-paper text-ink">
          {status === "loading" ? <Loader2 className="animate-spin" size={26} /> : status === "saved" ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
        </div>
        <p className="text-sm font-bold text-ink">{message}</p>
        <p className="mt-3 text-xs leading-5 text-graphite/55">
          {status === "loading" ? "Please keep this page open for a moment." : status === "saved" ? "Opening the saved item now." : "Open a supported page and run the bookmarklet again."}
        </p>
      </main>
    </AppShell>
  );
}

function parseImportPayload(raw: string): ImportPayload {
  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // Keep the original payload when it is already decoded.
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as ImportPayload;
    } catch {
      // Try the next representation.
    }
  }

  try {
    const normalized = raw.replace(/-/gu, "+").replace(/_/gu, "/");
    const decoded = decodeURIComponent(
      Array.from(atob(normalized), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
    );
    return JSON.parse(decoded) as ImportPayload;
  } catch {
    throw new Error("Invalid import payload");
  }
}

function readImportDataFromUrl() {
  const queryParams = new URLSearchParams(window.location.search);
  const fromQuery = queryParams.get("data") || queryParams.get("b64");
  if (fromQuery) return fromQuery;

  const hash = window.location.hash.replace(/^#/u, "");
  const hashParams = new URLSearchParams(hash);
  const fromHash = hashParams.get("data") || hashParams.get("b64");
  return fromHash || "";
}

function createWatchlistItem(payload: ImportPayload): WatchlistItem {
  const sourceUrl = normalizeUrl(payload.url || "");
  if (!sourceUrl) throw new Error("Missing source URL");

  const rawText = cleanText(payload.selectedText || payload.rawText || payload.description || "");
  const site = getSite(payload.site || sourceUrl);
  const code = normalizeCode(payload.code || readAnyLabel(rawText, codeLabels) || extractCode(sourceUrl) || extractCode(payload.title || "") || extractCode(rawText));
  const title = cleanTitle(payload.title || readAnyLabel(rawText, titleLabels) || code || sourceUrl, code);

  return normalizeWatchlistItem({
    id: createId(code, sourceUrl),
    sourceUrl,
    site,
    title,
    code,
    coverUrl: normalizeUrl(payload.coverUrl || payload.cover || payload.imageUrl || ""),
    previewUrl: normalizeUrl(payload.previewUrl || ""),
    actresses: sanitizePeople(payload.actresses?.length ? payload.actresses : textToLinks(readAnyLabel(rawText, actressLabels))),
    genres: sanitizeGenres(payload.genres?.length ? payload.genres : textToLinks(readAnyLabel(rawText, genreLabels))),
    releaseDate: cleanReleaseDate(payload.releaseDate || readAnyLabel(rawText, releaseDateLabels)),
    savedAt: new Date().toISOString()
  });
}

function getSite(value: string): WatchlistItem["site"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("jable")) return "jable";
  if (normalized.includes("missav")) return "missav";
  return "unknown";
}

function extractCode(value: string) {
  const match = /([a-z]{2,8})[-_ ]?(\d{2,6})/iu.exec(value);
  return match ? `${match[1]}-${match[2]}` : "";
}

function createId(code: string, sourceUrl: string) {
  return (code || sourceUrl).toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "") || crypto.randomUUID();
}

function normalizeUrl(value: string) {
  const trimmed = cleanText(value);
  if (!trimmed) return "";
  try {
    return new URL(trimmed).href;
  } catch {
    return trimmed;
  }
}

function readAnyLabel(value: string, labels: string[]) {
  for (const label of labels) {
    const result = readLabel(value, label);
    if (result) return result;
  }
  return "";
}

function readLabel(value: string, label: string) {
  if (!value) return "";
  const escaped = escapeRegExp(label);
  const stopLabels = allLabels.filter((item) => item.toLowerCase() !== label.toLowerCase()).map(escapeRegExp).join("|");
  const pattern = new RegExp(`${escaped}\\s*[:\\uFF1A]\\s*([\\s\\S]*?)(?=\\s+(?:${stopLabels})\\s*[:\\uFF1A]|$)`, "iu");
  return cleanText(pattern.exec(value)?.[1] || "");
}

function textToLinks(value: string): WatchlistPerson[] {
  if (!value) return [];
  return value
    .split(/[,\uFF0C\u3001/]/u)
    .map((name) => cleanText(name))
    .filter(Boolean)
    .map((name) => ({ name }));
}

function cleanTitle(value: string, code: string) {
  const title = cleanText(value);
  if (!code) return title;
  const escaped = escapeRegExp(code);
  return title.replace(new RegExp(`^${escaped}\\s*[-:：]?\\s*${escaped}\\s*[-:：]?\\s*`, "iu"), `${code} `);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
