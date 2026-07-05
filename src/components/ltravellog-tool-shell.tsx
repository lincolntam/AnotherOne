"use client";

import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export function LtravelLogToolShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <AppShell showHeader={false}>
      <div className="min-h-[100svh] lg:grid lg:grid-cols-[minmax(420px,42vw)_1fr]">
        <aside className="hidden border-r border-black/[0.05] bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col justify-between px-10 py-10">
            <div>
              <Link href={"/ltravellog/categories" as Route} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink" aria-label="Back">
                <ArrowLeft size={19} />
              </Link>
              <div className="mt-16 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-ink">AnotherOne</p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-graphite/45">{subtitle}</p>
              </div>
            </div>
            <div className="rounded-[5px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.75),transparent_7rem),linear-gradient(135deg,#dfe7dd,#c8d7dd,#d9bca7)] p-8 shadow-[0_18px_48px_rgba(34,34,34,0.08)]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">LtravelLog</p>
              <h2 className="mt-3 text-3xl font-black text-white">{title}</h2>
              <p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-white/80">Information panel stays on the right side for desktop and iPad, while mobile keeps the iPhone app layout.</p>
            </div>
            <div className="h-11" />
          </div>
        </aside>

        <section className="bg-white px-5 pb-24 pt-3 lg:max-h-screen lg:overflow-y-auto lg:px-12 lg:pb-16 lg:pt-10 xl:px-20">
          <div className="mb-7 flex items-center justify-center lg:hidden">
            <Link href={"/ltravellog/categories" as Route} className="absolute left-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink" aria-label="Back">
              <ArrowLeft size={18} />
            </Link>
            <div className="text-center">
              <h1 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink">AnotherOne</h1>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-graphite/45">{subtitle}</p>
            </div>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="mb-7 text-center lg:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite/40">LtravelLog</p>
              <h2 className="mt-2 text-2xl font-black text-ink lg:text-4xl">{title}</h2>
            </div>
            {children}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export function ToolCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-[0_18px_48px_rgba(34,34,34,0.08)] ${className}`}>
      {children}
    </div>
  );
}

export function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-graphite/45">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClassName = "w-full rounded-2xl border border-black/[0.05] bg-mist/70 px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-ink/20 focus:bg-white";
