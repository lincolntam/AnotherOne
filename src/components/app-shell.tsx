"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { SearchModal } from "@/components/search-modal";
import { useAuthStore } from "@/stores/auth-store";
import type { WebsiteShortcut } from "@/types/app";

type AppShellProps = {
  children: React.ReactNode;
  websites?: WebsiteShortcut[];
  showBottomNav?: boolean;
  showHeader?: boolean;
};

export function AppShell({ children, websites = [], showBottomNav = true, showHeader = true }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);
  const [checked, setChecked] = useState(false);
  const requiresAuth = isProtectedPath(pathname);
  const fullScreen = pathname.startsWith("/secret/anotherwm/list/");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!requiresAuth) {
        setChecked(true);
        return;
      }

      await hydrate();
      if (cancelled) return;
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setChecked(true);
    }

    setChecked(false);
    verify();
    return () => {
      cancelled = true;
    };
  }, [hydrate, pathname, requiresAuth, router]);

  useEffect(() => {
    if (!pathname.startsWith("/secret")) return;
    window.localStorage.removeItem("anotherone-anotherwm-watchlist");
    if ("caches" in window) {
      window.caches.keys()
        .then((keys) => Promise.all(keys.filter((key) => key.includes("anotherone-images")).map((key) => window.caches.delete(key))))
        .catch(() => undefined);
    }
  }, [pathname]);

  if (requiresAuth && (!checked || !user)) {
    return (
      <main className="ao-shell">
        <section className="ao-phone flex items-center justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-graphite/45">Loading</p>
        </section>
      </main>
    );
  }

  return (
    <main className="ao-shell">
      <section className={`ao-phone ${fullScreen ? "ao-phone-full" : ""}`}>
        {showHeader ? <Header /> : null}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {children}
        </motion.div>
        {showBottomNav ? <BottomNav /> : null}
        <SearchModal websites={websites} />
      </section>
    </main>
  );
}

function isProtectedPath(pathname: string) {
  return ["/home", "/profile", "/categories", "/websites", "/settings", "/secret"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
