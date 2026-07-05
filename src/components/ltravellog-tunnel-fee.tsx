"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ReceiptText } from "lucide-react";
import { fixedTunnels, getCurrentTunnelFees } from "@/features/ltravellog/logic";
import { FieldLabel, inputClassName, LtravelLogToolShell, ToolCard } from "@/components/ltravellog-tool-shell";

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LtravelLogTunnelFee() {
  const [dateValue, setDateValue] = useState(toLocalInputValue(new Date()));
  const selectedDate = useMemo(() => new Date(dateValue), [dateValue]);
  const rows = useMemo(() => getCurrentTunnelFees(Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate), [selectedDate]);

  return (
    <LtravelLogToolShell title="Tunnel Fee" subtitle="Private car" activeId="tunnel-fee">
      <div className="space-y-5">
        <ToolCard className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white">
              <CalendarClock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-graphite/40">Lookup time</p>
              <h3 className="mt-1 text-xl font-black text-ink">Hong Kong toll estimate</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-graphite/65">Uses the old LTravelLog 2026 private-car toll rules for harbour tunnels and Tai Lam Tunnel.</p>
            </div>
          </div>
          <FieldLabel label="Date and time">
            <input className={inputClassName} type="datetime-local" value={dateValue} onChange={(event) => setDateValue(event.target.value)} />
          </FieldLabel>
        </ToolCard>

        <ToolCard>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-graphite/40">Current fee</p>
          <div className="mt-4 divide-y divide-black/[0.05]">
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
        </ToolCard>

        <ToolCard>
          <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-graphite/40">
            <ReceiptText size={15} />
            Fixed tunnel reference
          </div>
          <div className="space-y-3">
            {fixedTunnels.map((tunnel) => (
              <div key={tunnel.id} className="flex items-center justify-between gap-4 rounded-3xl bg-mist/70 px-4 py-3">
                <div>
                  <p className="text-xs font-black text-ink">{tunnel.name}</p>
                  <p className="mt-1 text-[10px] font-bold text-graphite/45">{tunnel.rule}</p>
                </div>
                <p className="text-xs font-black text-ink">HK${tunnel.fee}</p>
              </div>
            ))}
          </div>
        </ToolCard>
      </div>
    </LtravelLogToolShell>
  );
}
