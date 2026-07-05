"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { describeChargingSlot, formatDateTime, getRangeCoverage, zoneOneChargingSlots } from "@/features/ltravellog/logic";
import { FieldLabel, inputClassName, LtravelLogToolShell, ToolCard } from "@/components/ltravellog-tool-shell";

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LtravelLogCharging() {
  const now = useMemo(() => new Date(), []);
  const defaultEnd = useMemo(() => {
    const value = new Date(now);
    value.setHours(value.getHours() + 2);
    return value;
  }, [now]);
  const [start, setStart] = useState(toLocalInputValue(now));
  const [end, setEnd] = useState(toLocalInputValue(defaultEnd));
  const slotInfo = describeChargingSlot(now);
  const coverage = useMemo(() => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!start || !end || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) return null;
    return getRangeCoverage(startDate, endDate);
  }, [start, end]);

  return (
    <LtravelLogToolShell title="Charging" subtitle="Zone 1" activeId="charging">
      <div className="space-y-5">
        <ToolCard className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white">
              <BatteryCharging size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-graphite/40">Current status</p>
              <h3 className="mt-1 text-xl font-black text-ink">{slotInfo.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-graphite/65">{slotInfo.body}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-mist/70 px-4 py-3 text-xs font-bold text-graphite/65">{slotInfo.meta}</div>
        </ToolCard>

        <ToolCard>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-graphite/40">Zone 1 timetable</p>
          <div className="mt-4 space-y-3">
            {zoneOneChargingSlots.map((slot) => (
              <div key={slot.label} className="flex items-center justify-between gap-4 rounded-3xl bg-mist/70 px-4 py-3">
                <span className="text-xs font-bold text-ink">{slot.label}</span>
                <Clock3 className="shrink-0 text-graphite/40" size={16} />
              </div>
            ))}
          </div>
        </ToolCard>

        <ToolCard className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-graphite/40">Range check</p>
          <div className="grid gap-3">
            <FieldLabel label="Start">
              <input className={inputClassName} type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
            </FieldLabel>
            <FieldLabel label="End">
              <input className={inputClassName} type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
            </FieldLabel>
          </div>
          <RangeResult coverage={coverage} start={start} end={end} />
        </ToolCard>
      </div>
    </LtravelLogToolShell>
  );
}

function RangeResult({ coverage, start, end }: { coverage: ReturnType<typeof getRangeCoverage> | null; start: string; end: string }) {
  if (!coverage) {
    return (
      <div className="flex items-center gap-3 rounded-3xl bg-mist/70 px-4 py-3 text-sm font-bold text-graphite/60">
        <XCircle size={17} />
        Please enter a valid time range.
      </div>
    );
  }

  if (coverage.fullyCovered) {
    return (
      <div className="rounded-3xl bg-ink px-4 py-4 text-white">
        <div className="flex items-center gap-2 text-sm font-black"><CheckCircle2 size={17} /> Available</div>
        <p className="mt-2 text-xs font-semibold leading-6 text-white/65">{formatDateTime(new Date(start))} to {formatDateTime(new Date(end))} is fully covered by Zone 1 power.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-mist/70 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-black text-ink"><XCircle size={17} /> Not fully covered</div>
      <p className="mt-2 text-xs font-semibold leading-6 text-graphite/65">
        {coverage.overlappingSlots.length ? `Partly overlaps: ${coverage.overlappingSlots.map((slot) => slot.label).join(", ")}` : `Next slot: ${coverage.nextSlot ? coverage.nextSlot.label : "-"}`}
      </p>
    </div>
  );
}
