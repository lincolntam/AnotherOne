"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSearchStore } from "@/stores/search-store";

type HeaderProps = {
  onOpenSetting?: () => void;
};

export function Header({ onOpenSetting }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const setSearchOpen = useSearchStore((state) => state.setOpen);
  const logout = useAuthStore((state) => state.logout);
  const categoriesHref = pathname.startsWith("/secret/anotherwm")
    ? "/secret/anotherwm/categories"
    : pathname.startsWith("/secret")
      ? "/secret/categories"
      : pathname.startsWith("/ltravellog")
        ? "/ltravellog/categories"
        : "/categories";
  const exitHref = pathname.startsWith("/secret/anotherwm")
    ? "/secret"
    : pathname.startsWith("/secret") || pathname.startsWith("/ltravellog")
      ? "/home"
      : "";

  return (
    <header className="relative z-20 mb-16 mt-12 flex items-center justify-between lg:mt-4">
      <button className="ao-icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}>
        <Search size={18} strokeWidth={1.8} />
      </button>

      <button
        className="absolute left-1/2 top-14 -translate-x-1/2 px-4 py-2 text-sm font-bold tracking-wide text-ink transition hover:text-graphite"
        onClick={() => setMenuOpen((value) => !value)}
      >
        AnotherOne <span className="text-xs text-graphite/45">v</span>
      </button>

      <Link className="ao-icon-button" aria-label="Categories" href={categoriesHref as Route}>
        <Menu size={18} strokeWidth={1.8} />
      </Link>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="absolute left-1/2 top-[92px] z-50 w-48 -translate-x-1/2 rounded-[24px] border border-black/[0.04] bg-white/95 p-2 shadow-journal backdrop-blur"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
          >
            {exitHref ? (
              <Link className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-mist/70" href={exitHref}>
                <ArrowLeft size={17} />
                Exit
              </Link>
            ) : null}
            <Link className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-mist/70" href="/profile">
              <UserRound size={17} />
              Profile
            </Link>
            {onOpenSetting ? (
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm hover:bg-mist/70" onClick={onOpenSetting}>
                <Settings size={17} />
                Setting
              </button>
            ) : null}
            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm hover:bg-mist/70" onClick={logout}>
              <LogOut size={17} />
              Logout
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
