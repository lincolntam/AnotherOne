"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { SearchModal } from "@/components/search-modal";
import { ImageDrawSettings } from "@/components/image-draw-settings";
import { useAuthStore } from "@/stores/auth-store";
import type { WebsiteShortcut } from "@/types/app";
import { getImageDrawKey } from "@/utils/image-draw";

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
  const [settingOpen, setSettingOpen] = useState(false);
  const requiresAuth = isProtectedPath(pathname);
  const fullScreen = pathname.startsWith("/secret/anotherwm/list/") ||
    pathname.startsWith("/secret/anotherin") ||
    pathname.startsWith("/ltravellog/trip-planner") ||
    pathname.startsWith("/ltravellog/charging") ||
    pathname.startsWith("/ltravellog/tunnel-fee");
  const pageScrollable = pathname.startsWith("/ltravellog/charging") ||
    pathname.startsWith("/ltravellog/tunnel-fee");
  const drawKey = getImageDrawKey(pathname);

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

  const animatedContent = (
    <motion.div
      className={pageScrollable
        ? "flex min-h-full w-full min-w-0 flex-none flex-col overflow-x-hidden"
        : fullScreen
          ? "flex h-full min-h-0 min-w-0 flex-1 overflow-x-hidden"
          : "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pb-28 [-webkit-overflow-scrolling:touch]"}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );

  return (
    <main className="ao-shell">
      <section className={`ao-phone ${fullScreen ? "ao-phone-full" : ""} ${pageScrollable ? "ao-phone-page-scroll" : ""}`}>
        {showHeader ? <Header onOpenSetting={() => setSettingOpen(true)} /> : null}
        {animatedContent}
        {showBottomNav ? <BottomNav /> : null}
        <SearchModal websites={websites} />
        <ImageDrawSettings drawKey={drawKey} open={settingOpen} onClose={() => setSettingOpen(false)} />
      </section>
    </main>
  );
}

function isProtectedPath(pathname: string) {
  return ["/home", "/profile", "/categories", "/websites", "/settings", "/secret", "/ltravellog"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
