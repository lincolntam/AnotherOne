"use client";

import { CalendarDays, CloudSun, Home, Pencil, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchStore } from "@/stores/search-store";

export function BottomNav() {
  const pathname = usePathname();
  const setSearchOpen = useSearchStore((state) => state.setOpen);
  const inAnotherWM = pathname.startsWith("/secret/anotherwm");
  const inAnotherWMList = pathname === "/secret/anotherwm/list";
  const inLtravelLog = pathname.startsWith("/ltravellog");
  const journalHref = inAnotherWM
    ? (pathname === "/secret/anotherwm" ? "/secret/anotherwm/categories" : "/secret/anotherwm")
    : inLtravelLog
      ? (pathname === "/ltravellog" ? "/ltravellog/categories" : "/ltravellog")
      : pathname === "/categories"
        ? "/home"
        : "/categories";
  const journalIsHome = inAnotherWM ? pathname !== "/secret/anotherwm" : inLtravelLog ? pathname !== "/ltravellog" : pathname === "/categories";

  function handleEdit(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!inAnotherWM) return;
    if (pathname !== "/secret/anotherwm") {
      window.sessionStorage.setItem("anotherwm-open-add", "true");
      return;
    }
    event.preventDefault();
    window.dispatchEvent(new Event("anotherwm:add"));
  }

  function handleJournal(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!inAnotherWMList) return;
    event.preventDefault();
    setSearchOpen(true);
  }

  return (
    <nav className="absolute bottom-2 left-0 right-0 z-40 flex items-center justify-center">
      <div className="flex w-full items-center justify-between px-8">
        <div className="flex h-11 min-w-[148px] items-center gap-2 rounded-full border border-black/[0.04] bg-white px-4 text-[10px] font-bold uppercase leading-tight text-graphite/70 shadow-[0_12px_28px_rgba(34,34,34,0.08)]">
          <CloudSun size={21} strokeWidth={1.7} />
          <span>
            Today
            <span className="block text-[9px] text-graphite/45">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={inAnotherWM ? "/secret/anotherwm" : "/websites"} aria-label={inAnotherWM ? "Add watchlist URL" : "Edit websites"} onClick={handleEdit} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)] transition active:scale-95">
            <Pencil size={18} />
          </Link>
          <Link href={journalHref as Route} aria-label={inAnotherWMList ? "Search watchlist" : "Open journal list"} onClick={handleJournal} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)] transition active:scale-95">
            {inAnotherWMList ? <Search size={18} /> : journalIsHome ? <Home size={18} /> : <CalendarDays size={18} />}
          </Link>
        </div>
      </div>
    </nav>
  );
}
