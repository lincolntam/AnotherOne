"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { JournalHeader, JournalList } from "@/components/journal-list";
import { useWebsiteStore } from "@/stores/website-store";

export default function CategoriesPage() {
  const { websites, load, openWebsite } = useWebsiteStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell websites={websites} showHeader={false}>
      <JournalHeader backHref="/home" />
      {websites.length ? (
        <JournalList websites={websites} onOpen={(item) => openWebsite(item)} />
      ) : (
        <div className="flex min-h-[420px] items-center justify-center text-sm font-black uppercase tracking-[0.24em] text-graphite/35">
          NO RECORD
        </div>
      )}
    </AppShell>
  );
}
