"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { HomeCarousel } from "@/components/home-carousel";
import { useAuthStore } from "@/stores/auth-store";
import { useWebsiteStore } from "@/stores/website-store";
import { demoShortcuts } from "@/utils/demo-shortcuts";

export default function HomePage() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const { websites, analytics, load, loadAnalytics, openWebsite } = useWebsiteStore();
  const displayWebsites = websites.length ? websites : demoShortcuts;
  const displayAnalytics = analytics.length
    ? analytics
    : demoShortcuts.map((item) => ({
        websiteId: item.id,
        title: item.title,
        url: item.url,
        clickCount: item.clickCount,
        lastUsedAt: item.lastUsedAt
      }));

  useEffect(() => {
    hydrate();
    load();
    loadAnalytics();
  }, [hydrate, load, loadAnalytics]);

  return (
    <AppShell websites={websites}>
      <HomeCarousel websites={websites} onOpen={(website) => (websites.length ? openWebsite(website) : window.open(website.url, "_blank", "noopener,noreferrer"))} />

      <section className="mx-auto mt-2 w-[78%] space-y-3">
        {displayAnalytics.slice(0, 3).map((item) => (
          <button
            key={item.websiteId}
            className="flex w-full items-center justify-between border-b border-black/[0.05] py-3 text-left"
            onClick={() => {
              const website = displayWebsites.find((entry) => entry.id === item.websiteId);
              if (website) {
                if (websites.length) openWebsite(website);
                else window.open(website.url, "_blank", "noopener,noreferrer");
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
