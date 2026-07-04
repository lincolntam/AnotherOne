"use client";

import { EyeOff } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { JournalHeader } from "@/components/journal-list";
import { api } from "@/lib/api";
import type { WatchlistItem, WatchlistStatus } from "@/types/watchlist";
import { anotherWMShortcuts } from "@/utils/anotherwm-shortcuts";

type TagType = "actress" | "genre" | "status";

type TagEntry = {
  name: string;
  url?: string;
  count: number;
};

export default function AnotherWMTagsPage() {
  return (
    <Suspense fallback={null}>
      <AnotherWMTagsContent />
    </Suspense>
  );
}

function AnotherWMTagsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = normalizeType(searchParams.get("type"));
  const [allowed, setAllowed] = useState(false);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const tags = useMemo(() => collectTags(items, type), [items, type]);

  useEffect(() => {
    if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
      router.replace("/passcode");
      return;
    }
    setAllowed(true);
    api<WatchlistItem[]>("/api/secret/watchlist")
      .then(setItems)
      .catch(() => setItems([]));
  }, [router]);

  if (!allowed) return null;

  return (
    <AppShell websites={anotherWMShortcuts} showHeader={false}>
      <JournalHeader backHref="/secret/anotherwm/categories" />
      <div className="-mt-3 mb-7 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
        <EyeOff size={14} />
        {type}
      </div>

      {tags.length ? (
        <section className="flex flex-wrap justify-center gap-2 px-5 pb-8">
          {tags.map((tag) => (
            <Link key={`${tag.name}-${tag.url || ""}`} href={createListHref(type, tag) as Route} className="rounded-full bg-paper px-4 py-2 text-xs font-bold text-ink transition hover:bg-mist">
              {tag.name}
              <span className="ml-2 text-graphite/45">{tag.count}</span>
            </Link>
          ))}
        </section>
      ) : (
        <section className="mx-auto mt-16 w-[78%] text-center">
          <p className="text-sm font-semibold text-ink">No tags yet.</p>
          <p className="mt-2 text-xs leading-5 text-graphite/55">Save more items to build this list.</p>
        </section>
      )}
    </AppShell>
  );
}

function normalizeType(value: string | null): TagType {
  return value === "genre" || value === "status" ? value : "actress";
}

function collectTags(items: WatchlistItem[], type: TagType) {
  const map = new Map<string, TagEntry>();

  if (type === "status") {
    (["Pending", "Watched", "Again"] as WatchlistStatus[]).forEach((status) => {
      map.set(status, { name: status, count: items.filter((item) => (item.status || "Pending") === status).length });
    });
    return [...map.values()];
  }

  items.forEach((item) => {
    const source = type === "actress" ? item.actresses : item.genres;
    source.forEach((tag) => {
      const key = `${tag.name.toLowerCase()}|${tag.url || ""}`;
      const current = map.get(key);
      map.set(key, { name: tag.name, url: tag.url, count: (current?.count || 0) + 1 });
    });
  });

  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function createListHref(type: TagType, tag: TagEntry) {
  if (type === "status") return `/secret/anotherwm/list?status=${encodeURIComponent(tag.name)}`;
  return `/secret/anotherwm/list?${type}=${encodeURIComponent(tag.name)}${tag.url ? `&url=${encodeURIComponent(tag.url)}` : ""}`;
}
