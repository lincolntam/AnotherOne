"use client";

import { create } from "zustand";

type SearchStore = {
  open: boolean;
  query: string;
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  open: false,
  query: "",
  setOpen: (open) => set({ open }),
  setQuery: (query) => set({ query })
}));
