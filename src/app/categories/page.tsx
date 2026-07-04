"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { JournalHeader, JournalList } from "@/components/journal-list";
import { useWebsiteStore } from "@/stores/website-store";
import type { WebsiteShortcut } from "@/types/app";

const ltravelLogCard: WebsiteShortcut = {
  id: "ltravellog",
  userId: "portal",
  title: "LtravelLog",
  description: "Travel journal migration room.",
  url: "/ltravellog",
  imageUrl: "",
  category: "Record",
  displayOrder: 0,
  active: true,
  favorite: true,
  pinned: true,
  clickCount: 0,
  lastUsedAt: null,
  createdAt: "2026-07-05T00:00:00.000Z",
  updatedAt: "2026-07-05T00:00:00.000Z"
};

export default function CategoriesPage() {
  const { websites, load, openWebsite } = useWebsiteStore();
  const categoryItems = [ltravelLogCard];

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell websites={categoryItems} showHeader={false}>
      <JournalHeader backHref="/home" />
      {categoryItems.length ? (
        <JournalList
          websites={categoryItems}
          onOpen={(item) => {
            if (item.url.startsWith("/")) window.location.href = item.url;
            else if (websites.some((website) => website.id === item.id)) openWebsite(item);
            else window.open(item.url, "_blank", "noopener,noreferrer");
          }}
        />
      ) : (
        <div className="flex min-h-[420px] items-center justify-center text-sm font-black uppercase tracking-[0.24em] text-graphite/35">
          NO RECORD
        </div>
      )}
    </AppShell>
  );
}
