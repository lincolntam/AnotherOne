"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { HomeCarousel } from "@/components/home-carousel";
import { useAuthStore } from "@/stores/auth-store";
import { useWebsiteStore } from "@/stores/website-store";
import type { WebsiteShortcut } from "@/types/app";

const ltravelLogShortcut: WebsiteShortcut = {
  id: "ltravellog",
  userId: "system",
  title: "LtravelLog",
  description: "Migration room.",
  url: "/ltravellog",
  imageUrl: "",
  category: "Personal",
  displayOrder: 90,
  active: true,
  favorite: true,
  pinned: true,
  clickCount: 0,
  lastUsedAt: null,
  createdAt: "2026-07-05T00:00:00.000Z",
  updatedAt: "2026-07-05T00:00:00.000Z"
};

export default function HomePage() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const { websites, analytics, load, loadAnalytics, openWebsite } = useWebsiteStore();
  const displayWebsites = websites.some((website) => website.url === "/ltravellog" || website.id === "ltravellog")
    ? websites
    : [...websites, ltravelLogShortcut];

  useEffect(() => {
    hydrate();
    load();
    loadAnalytics();
  }, [hydrate, load, loadAnalytics]);

  return (
    <AppShell websites={displayWebsites}>
      <HomeCarousel websites={displayWebsites} onOpen={(website) => (website.id === "ltravellog" ? window.location.assign("/ltravellog") : websites.length ? openWebsite(website) : window.open(website.url, "_blank", "noopener,noreferrer"))} />

      <section className="mx-auto mt-2 w-[78%] space-y-3">
        {analytics.slice(0, 3).map((item) => (
          <button
            key={item.websiteId}
            className="flex w-full items-center justify-between border-b border-black/[0.05] py-3 text-left"
            onClick={() => {
              const website = websites.find((entry) => entry.id === item.websiteId);
              if (website) {
                openWebsite(website);
              }
            }}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">{item.title}</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-graphite/40">{item.clickCount} opens</span>
            </span>
            <span className="text-xs text-graphite/35">{item.lastUsedAt?.slice(5, 10) || "New"}</span>
          </button>
        ))}
      </section>
    </AppShell>
  );
}
