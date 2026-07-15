"use client";

import { LtravelLogFrame } from "@/components/ltravellog-frame";

export function LtravelLogToolShell({
  title,
  subtitle,
  activeId,
  heroImage,
  heroIcon,
  children
}: {
  title: string;
  subtitle: string;
  activeId?: string;
  heroImage?: string;
  heroIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <LtravelLogFrame
      activeId={activeId}
      mobileTitle={title}
      mobileSubtitle={subtitle}
      pageScrollable
      right={
        <section className="min-h-full min-w-0 bg-white lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-12 lg:py-7 lg:[-webkit-overflow-scrolling:touch] xl:px-20">
          <div
            className="relative h-[260px] w-full overflow-hidden bg-paper bg-cover bg-center lg:mx-auto lg:h-[430px] lg:max-w-[640px] lg:rounded-[5px] lg:shadow-[0_24px_65px_rgba(34,34,34,0.12)]"
            style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20" />
            {heroIcon ? (
              <div className="absolute left-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur-sm">
                {heroIcon}
              </div>
            ) : null}
          </div>

          <div className="mx-auto max-w-[520px] space-y-5 px-7 py-6 lg:px-0 lg:py-7">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite/40">LTravelLog</p>
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-graphite/40">{subtitle}</p>
              <h2 className="mt-2 text-2xl font-black text-ink">{title}</h2>
            </div>
            {children}
          </div>
        </section>
      }
    />
  );
}

export function DetailInfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 rounded-full bg-paper px-3 py-3 text-xs font-semibold text-graphite/70">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

export function DetailSection({
  icon,
  title,
  children
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-graphite/45">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </section>
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
