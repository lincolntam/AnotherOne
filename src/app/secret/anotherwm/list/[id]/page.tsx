"use client";

import { ArrowLeft, CalendarDays, ExternalLink, EyeOff, MoreHorizontal, Tag, UserRound, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ExternalCoverImage } from "@/components/external-cover-image";
import { api } from "@/lib/api";
import type { WatchlistItem, WatchlistStatus } from "@/types/watchlist";
import { isDirtyWatchlistItem } from "@/utils/watchlist-sanitize";

const actressTitle = "Actress";
const genreTitle = "Genre";

export default function AnotherWMDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<WatchlistItem | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
        router.replace("/passcode");
        return;
      }

      setAllowed(true);
      const id = decodeURIComponent(params.id);
      const remote = await api<WatchlistItem[]>("/api/secret/watchlist")
        .then((items) => items.find((entry) => entry.id === id))
        .catch(() => null);
      const saved = remote || null;

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
      <article className="min-h-[680px] overflow-hidden rounded-[34px] bg-white text-ink lg:grid lg:min-h-[640px] lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
        <div className="relative h-[260px] w-full bg-paper lg:h-full lg:min-h-[640px]">
          <ExternalCoverImage src={item.coverUrl} />
          <Link href="/secret/anotherwm/list" aria-label="Back" className="absolute left-4 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur">
            <ArrowLeft size={18} />
          </Link>
        </div>

        <div className="space-y-5 px-7 py-6 lg:flex lg:flex-col lg:justify-center lg:px-10 lg:py-10">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
            <EyeOff size={14} />
            AnotherWM
          </div>
          <div className="text-center lg:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-graphite/45">{item.code ? `Code: ${item.code}` : item.site}</p>
            <h1 className="mt-3 text-lg font-bold leading-7 text-ink">{item.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-graphite/70 lg:max-w-md">
            <InfoPill icon={<CalendarDays size={15} />} label={item.releaseDate || "No date"} />
            <InfoPill icon={<ExternalLink size={15} />} label={item.site} />
          </div>

          <MetaSection icon={<UserRound size={16} />} title={actressTitle}>
            {item.actresses.map((person) => <MetaLink key={person.name} kind="actress" name={person.name} url={person.url} />)}
          </MetaSection>

          <MetaSection icon={<Tag size={16} />} title={genreTitle}>
            {item.genres.map((genre) => <MetaLink key={genre.name} kind="genre" name={genre.name} url={genre.url} />)}
          </MetaSection>

          <MetaSection icon={<Tag size={16} />} title="Tag">
            {(["Pending", "Watched", "Again"] as WatchlistStatus[]).map((status) => (
              <button
                key={status}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${item.status === status ? "bg-ink text-white" : "bg-paper text-ink hover:bg-mist"}`}
                onClick={() => updateStatus(status)}
              >
                {status}
              </button>
            ))}
          </MetaSection>

          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.16)] lg:max-w-md" onClick={() => window.open(item.sourceUrl, "_blank", "noopener,noreferrer")}>
            Open source
          </button>

          <div className="relative flex items-center justify-between pt-1">
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-paper" aria-label="More actions" onClick={() => setMenuOpen((open) => !open)}>
              <MoreHorizontal size={22} />
            </button>
            <Link href="/secret/anotherwm/list" aria-label="Close" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-paper">
              <X size={18} />
            </Link>
            {menuOpen ? (
              <div className="absolute bottom-12 left-0 z-10 w-44 rounded-2xl border border-black/[0.04] bg-white p-2 text-left shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                <button className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-500 transition hover:bg-rose-50" onClick={removeItem}>
                  Remove from list
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </AppShell>
  );

  function updateStatus(status: WatchlistStatus) {
    if (!item) return;
    const next = { ...item, status };
    setItem(next);
    api<WatchlistItem>("/api/secret/watchlist", {
      method: "POST",
      body: JSON.stringify(next)
    }).catch(() => undefined);
  }

  function removeItem() {
    if (!item) return;
    api<{ ok: boolean }>("/api/secret/watchlist", {
      method: "DELETE",
      body: JSON.stringify({ id: item.id, sourceUrl: item.sourceUrl })
    }).catch(() => undefined);
    router.replace("/secret/anotherwm/list");
  }
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
  return fetched;
}

function shouldRefresh(item: WatchlistItem) {
  return !item.releaseDate || !item.genres.length || isDirtyWatchlistItem(item);
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

function MetaLink({ kind, name, url }: { kind: "actress" | "genre"; name: string; url?: string }) {
  const filterUrl = `/secret/anotherwm/list?${kind}=${encodeURIComponent(name)}${url ? `&url=${encodeURIComponent(url)}` : ""}`;
  return (
    <Link href={filterUrl as Route} className="rounded-full bg-paper px-3 py-2 text-xs font-semibold text-ink transition hover:bg-mist">
      {name}
    </Link>
  );
}
