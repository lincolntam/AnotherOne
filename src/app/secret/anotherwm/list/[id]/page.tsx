"use client";

import { ArrowLeft, CalendarDays, ExternalLink, EyeOff, Tag, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { WatchlistItem } from "@/types/watchlist";
import { findWatchlistItem, upsertWatchlistItem } from "@/utils/watchlist-storage";

const actressTitle = "\u5973\u512a";
const genreTitle = "\u985e\u578b";

export default function AnotherWMDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<WatchlistItem | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
        router.replace("/passcode");
        return;
      }

      setAllowed(true);
      const id = decodeURIComponent(params.id);
      const saved = await api<WatchlistItem[]>("/api/secret/watchlist")
        .then((items) => items.find((entry) => entry.id === id))
        .catch(() => findWatchlistItem(id));

      if (saved) {
        if (shouldRefresh(saved)) {
          const refreshed = await refreshWatchlistItem(saved).catch(() => null);
          if (refreshed) {
            if (!cancelled) {
              setItem(refreshed);
              setLoading(false);
            }
            return;
          }
        }

        if (!cancelled) {
          setItem(saved);
          setLoading(false);
        }
        return;
      }

      try {
        const fetched = await api<WatchlistItem>("/api/secret/watchlist/metadata", {
          method: "POST",
          body: JSON.stringify({ url: createSourceUrl(id) })
        });
        await api<WatchlistItem>("/api/secret/watchlist", {
          method: "POST",
          body: JSON.stringify(fetched)
        });
        upsertWatchlistItem(fetched);
        if (!cancelled) setItem(fetched);
      } catch {
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadItem();
    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  if (!allowed) return null;

  if (loading) {
    return (
      <AppShell showHeader={false} showBottomNav={false}>
        <div className="flex min-h-[640px] flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-ink">Loading information...</p>
          <p className="mt-2 text-xs text-graphite/50">Trying to read saved metadata.</p>
        </div>
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell showHeader={false} showBottomNav={false}>
        <div className="flex min-h-[640px] flex-col items-center justify-center px-8 text-center">
          <p className="text-sm font-semibold text-ink">No information yet.</p>
          <p className="mt-2 text-xs leading-5 text-graphite/50">Use the pencil button to paste the source URL first, or open a code that can be fetched from the supported source.</p>
          <Link href="/secret/anotherwm/list" className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-graphite/60">
            Back to list
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showHeader={false} showBottomNav={false}>
      <article className="min-h-[680px] overflow-hidden rounded-[34px] bg-white text-ink">
        <div className="relative h-[245px] w-full bg-paper">
          {item.coverUrl ? (
            <Image src={proxiedImageUrl(item.coverUrl)} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#f5f1e9,#dfe8e9)]" />
          )}
          <Link href="/secret/anotherwm/list" aria-label="Back" className="absolute left-4 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur">
            <ArrowLeft size={18} />
          </Link>
        </div>

        <div className="space-y-6 px-7 py-6">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
            <EyeOff size={14} />
            AnotherWM
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-graphite/45">{item.code || item.site}</p>
            <h1 className="mt-3 text-lg font-bold leading-7 text-ink">{item.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-graphite/70">
            <InfoPill icon={<CalendarDays size={15} />} label={item.releaseDate || "No date"} />
            <InfoPill icon={<ExternalLink size={15} />} label={item.site} />
          </div>

          <MetaSection icon={<UserRound size={16} />} title={actressTitle}>
            {item.actresses.map((person) => <MetaLink key={person.name} name={person.name} url={person.url} />)}
          </MetaSection>

          <MetaSection icon={<Tag size={16} />} title={genreTitle}>
            {item.genres.map((genre) => <MetaLink key={genre.name} name={genre.name} url={genre.url} />)}
          </MetaSection>

          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.16)]" onClick={() => window.open(item.sourceUrl, "_blank", "noopener,noreferrer")}>
            Open source
          </button>
        </div>
      </article>
    </AppShell>
  );
}

function createSourceUrl(id: string) {
  const normalized = id.trim().toLowerCase();
  if (/^https?:\/\//u.test(normalized)) return normalized;
  return `https://fourhoi.com/${normalized}/`;
}

async function refreshWatchlistItem(item: WatchlistItem) {
  const fetched = await api<WatchlistItem>("/api/secret/watchlist/metadata", {
    method: "POST",
    body: JSON.stringify({ url: item.sourceUrl })
  });
  await api<WatchlistItem>("/api/secret/watchlist", {
    method: "POST",
    body: JSON.stringify(fetched)
  });
  upsertWatchlistItem(fetched);
  return fetched;
}

function shouldRefresh(item: WatchlistItem) {
  return !item.coverUrl || !item.releaseDate || !item.genres.length || item.actresses.some((person) => /ranking|\u6392\u884c/iu.test(`${person.name} ${person.url || ""}`));
}

function proxiedImageUrl(value: string) {
  return `/api/secret/watchlist/image?url=${encodeURIComponent(value)}`;
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full bg-paper px-3 py-3 font-semibold capitalize">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function MetaSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-graphite/50">
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function MetaLink({ name, url }: { name: string; url?: string }) {
  if (!url) {
    return <span className="rounded-full bg-paper px-3 py-2 text-xs font-semibold text-ink">{name}</span>;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="rounded-full bg-paper px-3 py-2 text-xs font-semibold text-ink transition hover:bg-mist">
      {name}
    </a>
  );
}
