"use client";

import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, Loader2, Plus, X } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { HomeCarousel } from "@/components/home-carousel";
import { api } from "@/lib/api";
import type { WatchlistItem } from "@/types/watchlist";
import { anotherWMShortcuts } from "@/utils/anotherwm-shortcuts";
import { upsertWatchlistItem } from "@/utils/watchlist-storage";

export default function AnotherWMPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (window.sessionStorage.getItem("anotherone-secret-unlocked") === "true") {
      setAllowed(true);
      if (window.sessionStorage.getItem("anotherwm-open-add") === "true") {
        window.sessionStorage.removeItem("anotherwm-open-add");
        setAddOpen(true);
      }
      return;
    }
    router.replace("/passcode");
  }, [router]);

  useEffect(() => {
    function openAdd() {
      setAddOpen(true);
      setMessage("");
    }

    window.addEventListener("anotherwm:add", openAdd);
    return () => window.removeEventListener("anotherwm:add", openAdd);
  }, []);

  async function saveUrl(event: FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value) return;

    setSaving(true);
    setMessage("");
    try {
      const item = await api<WatchlistItem>("/api/secret/watchlist/metadata", {
        method: "POST",
        body: JSON.stringify({ url: value })
      });
      upsertWatchlistItem(item);
      setUrl("");
      setAddOpen(false);
      router.push("/secret/anotherwm/list" as Route);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!allowed) return null;

  return (
    <AppShell websites={anotherWMShortcuts}>
      <div className="-mt-2 mb-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-graphite/45">
        <EyeOff size={14} />
        AnotherWM Private
      </div>
      <HomeCarousel
        websites={anotherWMShortcuts}
        onOpen={(website) => {
          if (website.url.startsWith("/")) router.push(website.url as Route);
          else window.open(website.url, "_blank", "noopener,noreferrer");
        }}
      />

      <section className="mx-auto mt-2 w-[78%] space-y-3">
        {anotherWMShortcuts.map((item) => (
          <button
            key={item.id}
            className="flex w-full items-center justify-between border-b border-black/[0.05] py-3 text-left"
            onClick={() => (item.url.startsWith("/") ? router.push(item.url as Route) : window.open(item.url, "_blank", "noopener,noreferrer"))}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">{item.title}</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-graphite/40">{item.category}</span>
            </span>
            <span className="text-xs text-graphite/35">Private</span>
          </button>
        ))}
      </section>

      <AnimatePresence>
        {addOpen ? (
          <motion.div className="absolute inset-0 z-50 bg-white/70 p-5 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form
              className="mx-auto mt-28 rounded-[28px] bg-white p-4 shadow-journal"
              initial={{ y: 18, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.98 }}
              onSubmit={saveUrl}
            >
              <div className="flex items-center gap-3 rounded-full bg-paper px-4 py-3">
                <button
                  type="submit"
                  aria-label="Save source URL"
                  disabled={saving || !url.trim()}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-ink transition disabled:opacity-35"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                </button>
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  autoFocus
                  placeholder="Paste source URL"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
                <button type="button" aria-label="Close" onClick={() => setAddOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              {message ? <p className="px-4 pt-3 text-xs font-semibold text-rose-500">{message}</p> : null}
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}
