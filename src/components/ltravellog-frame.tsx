"use client";

import { ArrowLeft, CalendarDays, CloudSun, Home, Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import type { WebsiteShortcut } from "@/types/app";

export const ltravelLogTools: WebsiteShortcut[] = [
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

export function LtravelLogFrame({
  activeId,
  mobileTitle,
  mobileSubtitle,
  right,
  children,
  showMap = false,
  hideMobileHeader = false
}: {
  activeId?: string;
  mobileTitle?: string;
  mobileSubtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  showMap?: boolean;
  hideMobileHeader?: boolean;
}) {
  return (
    <AppShell websites={ltravelLogTools} showHeader={false} showBottomNav={false}>
      <main className="relative min-h-[100svh] overflow-hidden bg-white lg:grid lg:grid-cols-[minmax(420px,min(780px,48vw))_minmax(0,1fr)]">
        <aside className="relative z-20 hidden h-screen overflow-y-auto border-r border-black/[0.05] bg-white px-10 py-10 lg:block">
          <LeftContent activeId={activeId} />
        </aside>

        <section className="relative min-h-[100svh] bg-white">
          {showMap ? <LtravelLogMapBackground /> : null}
          <div className={`relative z-10 lg:hidden ${hideMobileHeader ? "hidden" : ""}`}>
            <MobileHeader
              title={mobileTitle ?? "LTravelLog"}
              subtitle={mobileSubtitle ?? "AnotherOne"}
              backHref={activeId ? "/ltravellog/categories" : "/ltravellog"}
            />
          </div>
          <div className="relative z-10">{right ?? children ?? <MobileToolList activeId={activeId} />}</div>
        </section>
      </main>
    </AppShell>
  );
}

function MobileToolList({ activeId }: { activeId?: string }) {
  return (
    <div className="space-y-5 px-5 pb-28 pt-8 lg:hidden">
      {ltravelLogTools.map((tool, index) => (
        <Link key={tool.id} href={tool.url as Route} className="grid w-full grid-cols-[52px_1fr] gap-3 text-left">
          <div className="flex min-h-[116px] items-center justify-center bg-white/70">
            <span className="max-h-[96px] text-center text-[11px] font-black uppercase leading-4 tracking-[0.16em] text-ink [writing-mode:vertical-rl]">
              {tool.title}
            </span>
          </div>
          <div className={`min-h-[116px] overflow-hidden rounded-[5px] shadow-[0_18px_48px_rgba(34,34,34,0.08)] ${activeId === tool.id ? "ring-2 ring-ink/15" : ""}`}>
            <div className={`relative h-[116px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.75),transparent_6rem),linear-gradient(135deg,#dfe7dd,#c8d7dd,#d9bca7)] ${index === 1 ? "hue-rotate-[12deg]" : ""} ${index === 2 ? "hue-rotate-[26deg]" : ""}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-80">{tool.category}</p>
                <p className="mt-1 text-sm font-black drop-shadow-sm">{tool.description}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function LtravelLogMapBackground() {
  return (
    <div
      className="absolute inset-0 bg-[#dfe8e6] bg-cover bg-center opacity-90"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.34),rgba(255,255,255,.34)),url('https://tile.openstreetmap.org/11/1673/859.png')"
      }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(124,139,146,.34))]" />
    </div>
  );
}

function LeftContent({ activeId }: { activeId?: string }) {
  return (
    <div className="flex min-h-full flex-col justify-between">
      <div>
        <Link href={"/ltravellog" as Route} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink" aria-label="Back">
          <ArrowLeft size={19} />
        </Link>
        <div className="mb-10 mt-5 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-ink">AnotherOne</p>
        </div>
        <div className="space-y-6">
          {ltravelLogTools.map((tool, index) => (
            <Link key={tool.id} href={tool.url as Route} className="grid w-full grid-cols-[44px_1fr] gap-4 text-left">
              <div className="flex min-h-[118px] items-center justify-center bg-white">
                <span className="max-h-[104px] text-center text-[11px] font-black uppercase leading-4 tracking-[0.16em] text-ink [writing-mode:vertical-rl]">
                  {tool.title}
                </span>
              </div>
              <div className={`min-h-[118px] overflow-hidden rounded-[5px] shadow-[0_18px_48px_rgba(34,34,34,0.08)] ${activeId === tool.id ? "ring-2 ring-ink/15" : ""}`}>
                <div className={`relative h-[118px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.75),transparent_6rem),linear-gradient(135deg,#dfe7dd,#c8d7dd,#d9bca7)] ${index === 1 ? "hue-rotate-[12deg]" : ""} ${index === 2 ? "hue-rotate-[26deg]" : ""}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-80">{tool.category}</p>
                    <p className="mt-1 text-sm font-black drop-shadow-sm">{tool.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div className="flex h-11 min-w-[148px] items-center gap-2 rounded-full border border-black/[0.04] bg-white px-4 text-[10px] font-bold uppercase leading-tight text-graphite/70 shadow-[0_12px_28px_rgba(34,34,34,0.08)]">
          <CloudSun size={21} strokeWidth={1.7} />
          <span>
            Today
            <span className="block text-[9px] text-graphite/45">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
            <Pencil size={18} />
          </span>
          <Link href={"/ltravellog/categories" as Route} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-[0_12px_24px_rgba(0,0,0,0.16)]" aria-label="LtravelLog categories">
            {activeId ? <Home size={18} /> : <CalendarDays size={18} />}
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileHeader({ title, subtitle, backHref }: { title: string; subtitle: string; backHref: Route }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <Link href={backHref} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/55 text-ink shadow-[0_12px_28px_rgba(34,34,34,0.08)] backdrop-blur" aria-label="Back">
        <ArrowLeft size={19} />
      </Link>
      <div className="text-center">
        <h1 className="text-2xl font-black text-ink">{title}</h1>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-graphite/45">{subtitle}</p>
      </div>
      <div className="h-12 w-12" />
    </div>
  );
}
