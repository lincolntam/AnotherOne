"use client";

import { AppShell } from "@/components/app-shell";
import { JournalHeader, JournalList } from "@/components/journal-list";
import type { WebsiteShortcut } from "@/types/app";

const ltravelLogTools: WebsiteShortcut[] = [
  {
    id: "trip-planner",
    userId: "ltravellog",
    title: "Trip Planner",
    description: "Distance, tunnel fee and EV cost in one route.",
    url: "/ltravellog/trip-planner",
    imageUrl: "",
    category: "Planner",
    displayOrder: 0,
    active: true,
    favorite: true,
    pinned: true,
    clickCount: 0,
    lastUsedAt: null,
    createdAt: "2026-07-05T00:00:00.000Z",
    updatedAt: "2026-07-05T00:00:00.000Z"
  },
  {
    id: "charging",
    userId: "ltravellog",
    title: "Charging",
    description: "Zone 1 charging window and range check.",
    url: "/ltravellog/charging",
    imageUrl: "",
    category: "EV",
    displayOrder: 1,
    active: true,
    favorite: true,
    pinned: true,
    clickCount: 0,
    lastUsedAt: null,
    createdAt: "2026-07-05T00:00:00.000Z",
    updatedAt: "2026-07-05T00:00:00.000Z"
  },
  {
    id: "tunnel-fee",
    userId: "ltravellog",
    title: "Tunnel Fee",
    description: "Hong Kong private car tunnel fee lookup.",
    url: "/ltravellog/tunnel-fee",
    imageUrl: "",
    category: "Fee",
    displayOrder: 2,
    active: true,
    favorite: true,
    pinned: true,
    clickCount: 0,
    lastUsedAt: null,
    createdAt: "2026-07-05T00:00:00.000Z",
    updatedAt: "2026-07-05T00:00:00.000Z"
  }
];

export default function LtravelLogCategoriesPage() {
  return (
    <AppShell websites={ltravelLogTools} showHeader={false}>
      <JournalHeader backHref="/ltravellog" />
      <JournalList
        websites={ltravelLogTools}
        onOpen={(item) => {
          window.location.href = item.url;
        }}
      />
    </AppShell>
  );
}
