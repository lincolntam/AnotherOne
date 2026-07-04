"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { WatchlistGenre, WatchlistItem, WatchlistPerson } from "@/types/watchlist";
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
};

const pendingImportKey = "anotherwm-pending-import";

export default function AnotherWMImportPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "saved" | "error">("loading");
  const [message, setMessage] = useState("Reading bookmark data...");

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("data");
    if (fromQuery) window.sessionStorage.setItem(pendingImportKey, fromQuery);

    if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
      window.sessionStorage.setItem("anotherone-secret-redirect", "/secret/anotherwm/import");
      router.replace("/passcode");
      return;
    }

    const raw = fromQuery || window.sessionStorage.getItem(pendingImportKey);
    if (!raw) {
      setStatus("error");
      setMessage("No import data found.");
      return;
    }

    try {
      const payload = JSON.parse(decodeURIComponent(raw)) as ImportPayload;
      const item = createWatchlistItem(payload);
      upsertWatchlistItem(item);
      window.sessionStorage.removeItem(pendingImportKey);
      setStatus("saved");
      setMessage("Saved to AnotherWM.");
      window.setTimeout(() => router.replace(`/secret/anotherwm/list/${encodeURIComponent(item.id)}` as Route), 650);
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

function createWatchlistItem(payload: ImportPayload): WatchlistItem {
  const sourceUrl = normalizeUrl(payload.url || "");
  if (!sourceUrl) throw new Error("Missing source URL");

  const site = getSite(payload.site || sourceUrl);
  const code = normalizeCode(payload.code || extractCode(sourceUrl) || extractCode(payload.title || ""));
  const title = cleanText(payload.title || code || sourceUrl);

  return {
    id: createId(code, sourceUrl),
    sourceUrl,
    site,
    title,
    code,
    coverUrl: normalizeUrl(payload.coverUrl || payload.cover || payload.imageUrl || ""),
    previewUrl: normalizeUrl(payload.previewUrl || ""),
    actresses: normalizeLinks(payload.actresses),
    genres: normalizeLinks(payload.genres),
    releaseDate: cleanText(payload.releaseDate || ""),
    savedAt: new Date().toISOString()
  };
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

function normalizeCode(value: string) {
  return value.trim().replace(/[_\s]+/gu, "-").toUpperCase();
}

function createId(code: string, sourceUrl: string) {
  return (code || sourceUrl).toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "") || crypto.randomUUID();
}

function normalizeLinks(items?: WatchlistPerson[]) {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items
    .map((item) => ({ name: cleanText(item.name), url: normalizeUrl(item.url || "") || undefined }))
    .filter((item) => {
      if (!item.name || seen.has(item.name.toLowerCase())) return false;
      seen.add(item.name.toLowerCase());
      return true;
    });
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

function cleanText(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}
