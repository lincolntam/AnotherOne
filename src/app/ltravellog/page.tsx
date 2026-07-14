"use client";

import { AppShell } from "@/components/app-shell";
import { HomeCarousel } from "@/components/home-carousel";

export default function LtravelLogPage() {
  return (
    <AppShell websites={[]}>
      <div className="mb-4 pt-1 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-graphite/45">Migration Room</p>
        <h1 className="mt-2 text-xl font-bold text-ink">LtravelLog</h1>
      </div>
      <HomeCarousel websites={[]} onOpen={() => undefined} />
      <section className="flex min-h-[260px] items-center justify-center text-sm font-black uppercase tracking-[0.24em] text-graphite/35">
        NO RECORD
      </section>
    </AppShell>
  );
}
