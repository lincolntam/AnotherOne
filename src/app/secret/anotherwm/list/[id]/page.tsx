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
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [codeInput, setCodeInput] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
        router.replace("/passcode");
        return;
      }

      setAllowed(true);
      const id = decodeURIComponent(params.id);
      const remoteItems = await api<WatchlistItem[]>("/api/secret/watchlist").catch(() => []);
      if (!cancelled) setItems(remoteItems);
      const remote = remoteItems.find((entry) => entry.id === id) || null;
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
        if (!cancelled) {
          setItem(fetched);
          setItems((current) => [fetched, ...current.filter((entry) => entry.id !== fetched.id)]);
        }
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
      <article className="min-h-[680px] overflow-hidden rounded-[34px] bg-white text-ink lg:grid lg:min-h-[100dvh] lg:grid-cols-[minmax(360px,0.38fr)_minmax(0,0.62fr)] lg:rounded-none">
        <WatchlistSidePane activeId={item.id} items={items} />

        <section className="bg-white lg:min-h-[100dvh] lg:overflow-y-auto lg:px-12 lg:py-7 xl:px-20">
          <div className="relative h-[260px] w-full overflow-hidden bg-paper lg:mx-auto lg:h-[430px] lg:max-w-[640px] lg:rounded-[5px] lg:shadow-[0_18px_46px_rgba(34,34,34,0.1)]">
            <ExternalCoverImage src={item.coverUrl} />
            <Link href="/secret/anotherwm/list" aria-label="Back" className="absolute left-4 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur lg:hidden">
              <ArrowLeft size={18} />
            </Link>
          </div>

          <div className="mx-auto max-w-[520px] space-y-5 px-7 py-6 lg:px-0 lg:py-7">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
              <EyeOff size={14} />
              AnotherWM
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-graphite/45">{item.code ? `Code: ${item.code}` : item.site}</p>
              <h1 className="mt-3 text-lg font-bold leading-7 text-ink">{item.title}</h1>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-graphite/70">
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

            <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,0,0,0.16)]" onClick={() => window.open(item.sourceUrl, "_blank", "noopener,noreferrer")}>
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
                  <button className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-ink transition hover:bg-paper" onClick={openImageEditor}>
                    Edit
                  </button>
                  <button className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-500 transition hover:bg-rose-50" onClick={removeItem}>
                    Remove from list
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </article>

      {editorOpen ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/75 p-6 backdrop-blur">
          <form className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-journal" onSubmit={saveItemEdits}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-ink">Edit</p>
              <button type="button" aria-label="Close editor" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-paper" onClick={() => setEditorOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-graphite/50">Code</label>
            <input className="ao-input mb-4" value={codeInput} onChange={(event) => setCodeInput(event.target.value)} placeholder="Code" autoFocus />
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-graphite/50">Image URL</label>
            <input className="ao-input" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Paste cover image URL" />
            <button className="ao-button mt-4 w-full" type="submit" disabled={!imageUrl.trim()}>
              Save
            </button>
          </form>
        </div>
      ) : null}
    </AppShell>
  );

  function updateStatus(status: WatchlistStatus) {
    if (!item) return;
    const next = { ...item, status };
    setItem(next);
    setItems((current) => current.map((entry) => (entry.id === next.id ? next : entry)));
    api<WatchlistItem>("/api/secret/watchlist", {
      method: "POST",
      body: JSON.stringify(next)
    }).catch(() => undefined);
  }

  function removeItem() {
    if (!item) return;
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    api<{ ok: boolean }>("/api/secret/watchlist", {
      method: "DELETE",
      body: JSON.stringify({ id: item.id, sourceUrl: item.sourceUrl })
    }).catch(() => undefined);
    router.replace("/secret/anotherwm/list");
  }

  function openImageEditor() {
    if (!item) return;
    setImageUrl(item.coverUrl);
    setCodeInput(item.code);
    setMenuOpen(false);
    setEditorOpen(true);
  }

  function saveItemEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;
    const nextCode = normalizeEditedCode(codeInput);
    const nextId = nextCode ? nextCode.toLowerCase() : item.id;
    const next = { ...item, id: nextId, code: nextCode, coverUrl: imageUrl.trim() };
    setItem(next);
    setItems((current) => current.map((entry) => (entry.id === item.id ? next : entry)));
    setEditorOpen(false);
    api<WatchlistItem>("/api/secret/watchlist", {
      method: "POST",
      body: JSON.stringify(next)
    })
      .then(() => {
        if (next.id !== item.id) router.replace(`/secret/anotherwm/list/${encodeURIComponent(next.id)}` as Route);
      })
      .catch(() => undefined);
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

function normalizeEditedCode(value: string) {
  return value.trim().replace(/[_\s]+/gu, "-").toUpperCase();
}

function WatchlistSidePane({ activeId, items }: { activeId: string; items: WatchlistItem[] }) {
  return (
    <aside className="hidden min-h-[100dvh] border-r border-black/[0.06] bg-white lg:flex lg:flex-col">
      <div className="flex w-full items-center justify-between px-8 py-7">
        <Link href="/secret/anotherwm/list" aria-label="Back to watchlist" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-paper">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.34em] text-ink">AnotherOne</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-graphite/45">
            <EyeOff size={14} />
            Watchlist
          </div>
        </div>
        <span className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32">
        <div className="space-y-7">
          {items.map((entry) => (
            <Link key={entry.id} href={`/secret/anotherwm/list/${encodeURIComponent(entry.id)}` as Route} className="grid grid-cols-[3.1rem_minmax(0,1fr)] items-center gap-5">
              <div className={`justify-self-center [writing-mode:vertical-rl] text-[12px] font-black uppercase tracking-[0.18em] ${entry.id === activeId ? "text-ink" : "text-ink/75"}`}>
                {entry.code || entry.id}
              </div>
              <div className={`relative h-[118px] overflow-hidden rounded-[5px] bg-paper shadow-[0_12px_28px_rgba(34,34,34,0.08)] transition ${entry.id === activeId ? "ring-2 ring-ink/80" : "hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(34,34,34,0.12)]"}`}>
                <ExternalCoverImage src={entry.coverUrl} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/42 via-black/15 to-black/18" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">{entry.releaseDate || "Saved"}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-black leading-5">{entry.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
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
