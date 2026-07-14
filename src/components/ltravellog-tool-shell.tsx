"use client";

import { LtravelLogFrame } from "@/components/ltravellog-frame";

export function LtravelLogToolShell({
  title,
  subtitle,
  activeId,
  children
}: {
  title: string;
  subtitle: string;
  activeId?: string;
  children: React.ReactNode;
}) {
  return (
    <LtravelLogFrame
      activeId={activeId}
      mobileTitle={title}
      mobileSubtitle={subtitle}
      pageScrollable
      right={
        <section className="min-h-full min-w-0 bg-white px-5 pb-8 pt-7 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-12 lg:pb-10 lg:pt-10 lg:[-webkit-overflow-scrolling:touch] xl:px-20">
          <div className="mx-auto max-w-2xl">
            <div className="mb-7 text-center lg:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite/40">LtravelLog</p>
              <h2 className="mt-2 text-2xl font-black text-ink lg:text-4xl">{title}</h2>
            </div>
            {children}
          </div>
        </section>
      }
    />
  );
}

export function ToolCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-[0_18px_48px_rgba(34,34,34,0.08)] ${className}`}>
      {children}
    </div>
  );
}

export function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 text-[10px] font-black uppercase tracking-[0.16em] text-graphite/45">
      {label}
      <div className="mt-2 min-w-0">{children}</div>
    </label>
  );
}

export const inputClassName = "block w-full min-w-0 max-w-full rounded-2xl border border-black/[0.05] bg-mist/70 px-4 py-3 text-base font-semibold text-ink outline-none transition focus:border-ink/20 focus:bg-white md:text-sm";
