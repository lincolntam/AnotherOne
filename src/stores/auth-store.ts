"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { AppUser } from "@/types/app";

type AuthStore = {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const user = await api<AppUser>("/api/auth/me");
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password, remember) => {
    set({ loading: true, error: null });
    try {
      const user = await api<AppUser>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember })
      });
      set({ user, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Login failed.", loading: false });
      throw error;
    }
  },
  logout: async () => {
    await api<boolean>("/api/auth/logout", { method: "POST" });
    set({ user: null });
    window.location.href = "/login";
  }
}));
