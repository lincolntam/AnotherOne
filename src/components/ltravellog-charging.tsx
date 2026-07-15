"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, CheckCircle2, Clock3, Gauge, XCircle } from "lucide-react";
import {
  describeChargingSlot,
  formatDateTime,
  getRangeCoverage,
  zoneOneChargingSlots
} from "@/features/ltravellog/logic";
import {
  DetailInfoPill,
  DetailSection,
  FieldLabel,
  inputClassName,
  LtravelLogToolShell
} from "@/components/ltravellog-tool-shell";

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
    if (!start || !end || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return null;
    }
    return getRangeCoverage(startDate, endDate);
  }, [start, end]);

  return (
    <LtravelLogToolShell
      title="充電"
      subtitle="Zone 1"
      activeId="charging"
      heroImage="/Tesla.jpg"
      heroIcon={<BatteryCharging size={19} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <DetailInfoPill icon={<BatteryCharging size={15} />} label={slotInfo.title} />
        <DetailInfoPill icon={<Gauge size={15} />} label="Zone 1" />
      </div>

      <DetailSection icon={<BatteryCharging size={15} />} title="目前狀態">
        <h3 className="text-lg font-black text-ink">{slotInfo.title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-graphite/65">{slotInfo.body}</p>
        <p className="mt-3 rounded-full bg-paper px-4 py-3 text-xs font-bold text-graphite/65">{slotInfo.meta}</p>
      </DetailSection>

      <DetailSection icon={<Clock3 size={15} />} title="供電時段">
        <div className="space-y-2">
          {zoneOneChargingSlots.map((slot) => (
            <div key={slot.label} className="flex items-center justify-between gap-4 border-b border-black/[0.05] px-1 py-3 last:border-b-0">
              <span className="text-xs font-bold text-ink">{slot.label}</span>
              <Clock3 className="shrink-0 text-graphite/40" size={16} />
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection icon={<Gauge size={15} />} title="時段檢查">
        <div className="space-y-4">
          <div className="grid gap-3">
            <FieldLabel label="開始">
              <input className={inputClassName} type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
            </FieldLabel>
            <FieldLabel label="結束">
              <input className={inputClassName} type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
            </FieldLabel>
          </div>
          <RangeResult coverage={coverage} start={start} end={end} />
        </div>
      </DetailSection>
    </LtravelLogToolShell>
  );
}

function RangeResult({ coverage, start, end }: { coverage: ReturnType<typeof getRangeCoverage> | null; start: string; end: string }) {
  if (!coverage) {
    return (
      <div className="flex items-center gap-3 rounded-3xl bg-mist/70 px-4 py-3 text-sm font-bold text-graphite/60">
        <XCircle size={17} />
        請選擇有效的開始及結束時間。
      </div>
    );
  }

  if (coverage.fullyCovered) {
    return (
      <div className="rounded-3xl bg-ink px-4 py-4 text-white">
        <div className="flex items-center gap-2 text-sm font-black"><CheckCircle2 size={17} /> 適用</div>
        <p className="mt-2 text-xs font-semibold leading-6 text-white/65">
          {formatDateTime(new Date(start))} 至 {formatDateTime(new Date(end))} 完全位於 Zone 1 供電時段內。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-mist/70 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-black text-ink"><XCircle size={17} /> 未完全涵蓋</div>
      <p className="mt-2 text-xs font-semibold leading-6 text-graphite/65">
        {coverage.overlappingSlots.length
          ? `部分重疊：${coverage.overlappingSlots.map((slot) => slot.label).join("、")}`
          : `下一個時段：${coverage.nextSlot?.label ?? "-"}`}
      </p>
    </div>
  );
}
