"use client";

import { EyeOff } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { JournalHeader } from "@/components/journal-list";
import { api } from "@/lib/api";
import type { WatchlistItem } from "@/types/watchlist";
import { loadWatchlist } from "@/utils/watchlist-storage";
import { anotherWMShortcuts } from "@/utils/anotherwm-shortcuts";

export default function AnotherWMListPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
      router.replace("/passcode");
      return;
    }
    setAllowed(true);
    api<WatchlistItem[]>("/api/secret/watchlist")
      .then(setItems)
      .catch(() => setItems(loadWatchlist()));
  }, [router]);

  if (!allowed) return null;

  return (
    <AppShell websites={anotherWMShortcuts} showHeader={false}>
      <JournalHeader backHref="/secret/anotherwm/categories" />
      <div className="-mt-3 mb-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
        <EyeOff size={14} />
        Watchlist
      </div>

      {items.length ? (
        <section className="space-y-5 pb-6">
          {items.map((item) => (
            <button key={item.id} className="grid w-full grid-cols-[58px_1fr] gap-3 text-left" onClick={() => router.push(`/secret/anotherwm/list/${encodeURIComponent(item.id)}` as Route)}>
              <div className="flex min-h-[116px] items-center justify-center bg-white">
                <span className="max-h-[96px] text-center text-[11px] font-bold uppercase leading-4 tracking-[0.16em] [writing-mode:vertical-rl] text-ink">
                  {item.code || item.site}
                </span>
              </div>
              <div className="ao-card min-h-[116px] overflow-hidden">
                <div className="relative h-[116px] w-full">
                  {item.coverUrl ? <Image src={item.coverUrl} alt="" fill className="object-cover" unoptimized /> : <div className="absolute inset-0 bg-[linear-gradient(135deg,#ece7de,#d6e2e5,#d5c1b2)]" />}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/5 to-black/20" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-80">{item.releaseDate || "Saved"}</p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold drop-shadow-sm">{item.title}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </section>
      ) : (
        <section className="mx-auto mt-16 w-[78%] text-center">
          <p className="text-sm font-semibold text-ink">No saved items yet.</p>
          <p className="mt-2 text-xs leading-5 text-graphite/55">Use the pencil button to paste a supported URL.</p>
        </section>
      )}
    </AppShell>
  );
}
