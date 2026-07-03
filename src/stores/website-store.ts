"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { UsageSummary, WebsiteShortcut } from "@/types/app";

type WebsiteStore = {
  websites: WebsiteShortcut[];
  analytics: UsageSummary[];
  loading: boolean;
  load: (admin?: boolean) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  openWebsite: (website: WebsiteShortcut) => Promise<void>;
};

export const useWebsiteStore = create<WebsiteStore>((set, get) => ({
  websites: [],
  analytics: [],
  loading: false,
  load: async (admin = false) => {
    set({ loading: true });
    const websites = await api<WebsiteShortcut[]>(`/api/websites${admin ? "?admin=1" : ""}`);
    set({ websites, loading: false });
  },
  loadAnalytics: async () => {
    const analytics = await api<UsageSummary[]>("/api/analytics");
    set({ analytics });
  },
  openWebsite: async (website) => {
    window.open(website.url, "_blank", "noopener,noreferrer");
    await api<boolean>(`/api/websites/${website.id}/open`, { method: "POST" });
    await get().load(false);
  }
}));
