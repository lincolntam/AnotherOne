"use client";

import { useMemo, useState } from "react";
import { CalendarClock, MapPinned, ReceiptText } from "lucide-react";
import { fixedTunnels, getCurrentTunnelFees } from "@/features/ltravellog/logic";
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

export function LtravelLogTunnelFee() {
  const [dateValue, setDateValue] = useState(toLocalInputValue(new Date()));
  const selectedDate = useMemo(() => new Date(dateValue), [dateValue]);
  const rows = useMemo(
    () => getCurrentTunnelFees(Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate),
    [selectedDate]
  );

  return (
    <LtravelLogToolShell
      title="隧道費"
      subtitle="私家車"
      activeId="tunnel-fee"
      heroImage="https://tile.openstreetmap.org/11/1673/859.png"
      heroIcon={<ReceiptText size={19} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <DetailInfoPill icon={<CalendarClock size={15} />} label={dateValue.slice(0, 10)} />
        <DetailInfoPill icon={<MapPinned size={15} />} label="香港" />
      </div>

      <DetailSection icon={<CalendarClock size={15} />} title="查詢時間">
        <p className="mb-4 text-sm font-semibold leading-6 text-graphite/65">
          按 LTravelLog 2026 香港私家車收費規則，查閱過海隧道、大欖隧道及其他固定收費。
        </p>
        <FieldLabel label="日期及時間">
          <input className={inputClassName} type="datetime-local" value={dateValue} onChange={(event) => setDateValue(event.target.value)} />
        </FieldLabel>
      </DetailSection>

      <DetailSection icon={<ReceiptText size={15} />} title="目前收費">
        <div className="divide-y divide-black/[0.05]">
          {rows.map((row) => (
            <div key={row.name} className="grid grid-cols-[1fr_auto] gap-3 py-3">
              <div>
                <p className="text-sm font-black text-ink">{row.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-graphite/50">{row.rule}</p>
              </div>
              <p className="text-sm font-black text-ink">HK${row.fee}</p>
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection icon={<ReceiptText size={15} />} title="固定收費參考">
        <div className="space-y-3">
          {fixedTunnels.map((tunnel) => (
            <div key={tunnel.id} className="flex items-center justify-between gap-4 rounded-full bg-paper px-4 py-3">
              <div>
                <p className="text-xs font-black text-ink">{tunnel.name}</p>
                <p className="mt-1 text-[10px] font-bold text-graphite/45">{tunnel.rule}</p>
              </div>
              <p className="text-xs font-black text-ink">HK${tunnel.fee}</p>
            </div>
          ))}
        </div>
      </DetailSection>
    </LtravelLogToolShell>
  );
}
