"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { JournalHeader, JournalList } from "@/components/journal-list";
import { anotherWMShortcuts } from "@/utils/anotherwm-shortcuts";

export default function AnotherWMCategoriesPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("anotherone-secret-unlocked") !== "true") {
      router.replace("/passcode");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) return null;

  return (
    <AppShell websites={anotherWMShortcuts} showHeader={false}>
      <JournalHeader backHref="/secret/anotherwm" />
      <JournalList
        websites={anotherWMShortcuts}
        onOpen={(item) => {
          if (item.url.startsWith("/")) {
            router.push(item.url as Route);
            return;
          }
          window.open(item.url, "_blank", "noopener,noreferrer");
        }}
      />
    </AppShell>
  );
}
