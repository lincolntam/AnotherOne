"use client";

import { AppShell } from "@/components/app-shell";
import { JournalHeader, JournalList } from "@/components/journal-list";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { privateShortcuts } from "@/utils/private-shortcuts";
import type { WebsiteShortcut } from "@/types/app";

const instagramWebLoginUrl = "https://www.instagram.com/accounts/login/";

const anotherWMCard: WebsiteShortcut = {
  id: "secret-anotherwm",
  userId: "secret",
  title: "AnotherWM",
  description: "Private watchlist memory room.",
  url: "/secret/anotherwm",
  imageUrl: "",
  category: "Room",
  displayOrder: 0,
  active: true,
  favorite: true,
  pinned: true,
  clickCount: 0,
  lastUsedAt: null,
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z"
};

const anotherInCard: WebsiteShortcut = {
  id: "secret-anotherin",
  userId: "secret",
  title: "AnotherIn",
  description: "Private Instagram viewer.",
  url: instagramWebLoginUrl,
  imageUrl: "",
  category: "Room",
  displayOrder: 1,
  active: true,
  favorite: true,
  pinned: true,
  clickCount: 0,
  lastUsedAt: null,
  createdAt: "2026-07-05T00:00:00.000Z",
  updatedAt: "2026-07-05T00:00:00.000Z"
};

export default function SecretCategoriesPage() {
  const router = useRouter();
  const secretCategoryItems = [anotherWMCard, anotherInCard, ...privateShortcuts];

  return (
    <AppShell websites={secretCategoryItems} showHeader={false}>
      <JournalHeader backHref="/secret" />
      <JournalList
        websites={secretCategoryItems}
        onOpen={(item) => {
          if (item.id === "secret-anotherwm") {
            router.push("/secret/anotherwm" as Route);
            return;
          }
          if (item.id === "secret-anotherin") {
            window.open(instagramWebLoginUrl, "_blank", "noopener,noreferrer");
            return;
          }
          window.open(item.url, "_blank", "noopener,noreferrer");
        }}
      />
    </AppShell>
  );
}
