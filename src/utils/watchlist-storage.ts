"use client";

import type { WatchlistItem } from "@/types/watchlist";

const key = "anotherone-anotherwm-watchlist";

export function loadWatchlist() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WatchlistItem[];
  } catch {
    return [];
  }
}

export function saveWatchlist(items: WatchlistItem[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function upsertWatchlistItem(item: WatchlistItem) {
  const items = loadWatchlist();
  const next = [item, ...items.filter((entry) => entry.id !== item.id && entry.sourceUrl !== item.sourceUrl)];
  saveWatchlist(next);
  return next;
}

export function removeWatchlistItem(id: string) {
  const next = loadWatchlist().filter((entry) => entry.id !== id && entry.sourceUrl !== id);
  saveWatchlist(next);
  return next;
}

export function findWatchlistItem(id: string) {
  return loadWatchlist().find((item) => item.id === id);
}
