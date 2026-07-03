"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { JournalHeader, JournalList } from "@/components/journal-list";
import { useWebsiteStore } from "@/stores/website-store";
import { demoShortcuts } from "@/utils/demo-shortcuts";

export default function CategoriesPage() {
  const { websites, load, openWebsite } = useWebsiteStore();
  const displayWebsites = websites.length ? websites : demoShortcuts;

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell websites={websites} showHeader={false}>
      <JournalHeader backHref="/home" />
      <JournalList
        websites={displayWebsites}
        onOpen={(item) => (websites.length ? openWebsite(item) : window.open(item.url, "_blank", "noopener,noreferrer"))}
      />
    </AppShell>
  );
}
