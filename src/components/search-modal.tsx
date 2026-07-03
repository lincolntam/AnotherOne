"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { KeyboardEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/stores/search-store";
import type { WebsiteShortcut } from "@/types/app";

type SearchModalProps = {
  websites: WebsiteShortcut[];
};

export function SearchModal({ websites }: SearchModalProps) {
  const router = useRouter();
  const { open, query, setOpen, setQuery } = useSearchStore();
  const normalizedQuery = query.trim().toLowerCase();
  const secretMode = normalizedQuery === "anotherone" || normalizedQuery === ".secret";

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return websites.slice(0, 6);
    return websites.filter((website) =>
      [website.title, website.description, website.url, website.category].some((part) => part.toLowerCase().includes(value))
    );
  }, [query, websites]);

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || !secretMode) return;
    event.preventDefault();
    setOpen(false);
    setQuery("");
    router.push("/passcode");
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 bg-ink/25 p-5 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="mx-auto mt-10 max-w-md rounded-app bg-paper p-4 shadow-journal dark:bg-graphite"
            initial={{ y: 28, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 28, scale: 0.98 }}
          >
            <div className="mb-4 flex items-center gap-3 rounded-full bg-white px-4 py-3 dark:bg-white/10">
              <Search size={18} />
              <input
                className="w-full bg-transparent text-sm outline-none"
                autoFocus
                placeholder="Search websites or categories"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button aria-label="Close search" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-2 overflow-auto">
              {results.map((website) => (
                <a
                  key={website.id}
                  className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm dark:bg-white/10"
                  href={website.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    <span className="block font-semibold">{website.title}</span>
                    <span className="text-xs opacity-60">{website.category}</span>
                  </span>
                  <span className="text-xs opacity-60">{website.clickCount} opens</span>
                </a>
              ))}
              {!results.length ? <p className="py-8 text-center text-sm opacity-60">No matching shortcuts.</p> : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
