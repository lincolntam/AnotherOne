"use client";

import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export function LtravelLogToolShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <AppShell showHeader={false}>
      <div className="mb-7 mt-3 flex items-center justify-center">
        <Link href={"/ltravellog/categories" as Route} className="absolute left-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink" aria-label="Back">
          <ArrowLeft size={18} />
        </Link>
        <div className="text-center">
          <h1 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink">AnotherOne</h1>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-graphite/45">{subtitle}</p>
        </div>
      </div>
      <section className="pb-24">
        <div className="mb-7 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite/40">LtravelLog</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{title}</h2>
        </div>
        {children}
      </section>
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
