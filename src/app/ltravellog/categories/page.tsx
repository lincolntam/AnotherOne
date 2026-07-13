"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { JournalHeader, JournalList } from "@/components/journal-list";
import { ltravelLogTools } from "@/components/ltravellog-frame";

export default function LtravelLogCategoriesPage() {
  const router = useRouter();

  return (
    <AppShell websites={ltravelLogTools} showHeader={false}>
      <div className="w-full">
        <JournalHeader backHref="/ltravellog" title="Category" />
        <JournalList websites={ltravelLogTools} onOpen={(item) => router.push(item.url as Route)} />
      </div>
    </AppShell>
  );
}
