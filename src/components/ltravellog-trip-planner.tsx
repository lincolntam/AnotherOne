"use client";

import { useMemo, useState } from "react";
import { Calculator, Clock3, Gauge, Route } from "lucide-react";
import { chargingPlans, calculateTripEstimate, tunnelOptions } from "@/features/ltravellog/logic";
import { FieldLabel, inputClassName, LtravelLogToolShell, ToolCard } from "@/components/ltravellog-tool-shell";

export function LtravelLogTripPlanner() {
  const [origin, setOrigin] = useState("Home");
  const [destination, setDestination] = useState("Destination");
  const [distance, setDistance] = useState(28);
  const [duration, setDuration] = useState(42);
  const [planId, setPlanId] = useState<string>(chargingPlans[0].id);
  const [tunnelId, setTunnelId] = useState("none");

  const estimate = useMemo(() => calculateTripEstimate(distance, duration, planId, tunnelId), [distance, duration, planId, tunnelId]);

  return (
    <LtravelLogToolShell title="Trip Planner" subtitle="Planner">
      <div className="space-y-5">
        <ToolCard>
          <div className="grid gap-4">
            <FieldLabel label="Origin">
              <input className={inputClassName} value={origin} onChange={(event) => setOrigin(event.target.value)} />
            </FieldLabel>
            <FieldLabel label="Destination">
              <input className={inputClassName} value={destination} onChange={(event) => setDestination(event.target.value)} />
            </FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <FieldLabel label="Distance km">
                <input className={inputClassName} type="number" min="0" step="0.1" value={distance} onChange={(event) => setDistance(Number(event.target.value) || 0)} />
              </FieldLabel>
              <FieldLabel label="Duration min">
                <input className={inputClassName} type="number" min="0" step="1" value={duration} onChange={(event) => setDuration(Number(event.target.value) || 0)} />
              </FieldLabel>
            </div>
            <FieldLabel label="Energy plan">
              <select className={inputClassName} value={planId} onChange={(event) => setPlanId(event.target.value)}>
                {chargingPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.label}</option>
                ))}
              </select>
            </FieldLabel>
            <FieldLabel label="Tunnel">
              <select className={inputClassName} value={tunnelId} onChange={(event) => setTunnelId(event.target.value)}>
                {tunnelOptions.map((tunnel) => (
                  <option key={tunnel.id} value={tunnel.id}>{tunnel.name}</option>
                ))}
              </select>
            </FieldLabel>
          </div>
        </ToolCard>

        <ToolCard className="space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite/40">Route</p>
            <h3 className="mt-1 text-lg font-black text-ink">{origin || "-"} to {destination || "-"}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={<Route size={17} />} label="Distance" value={`${estimate.distanceKm.toFixed(1)} km`} />
            <Metric icon={<Clock3 size={17} />} label="Time" value={`${estimate.durationMin} min`} />
            <Metric icon={<Gauge size={17} />} label="Tunnel fee" value={`HK$${estimate.tunnelFee}`} />
            <Metric icon={<Calculator size={17} />} label="EV cost" value={`HK$${estimate.energyCost.toFixed(1)}`} />
          </div>
          <div className="rounded-3xl bg-ink px-5 py-4 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">Total</p>
            <p className="mt-1 text-3xl font-black">HK${estimate.total.toFixed(1)}</p>
            <p className="mt-2 text-xs font-semibold text-white/60">Fuel car estimate HK${estimate.fuelCarCost.toFixed(1)}. Potential saving HK${estimate.fuelSavings.toFixed(1)}.</p>
          </div>
          <p className="text-xs font-semibold leading-6 text-graphite/60">Tunnel rule: {estimate.tollRule}. Google Maps route auto-detection from the old project is prepared for a later Maps API migration.</p>
        </ToolCard>
      </div>
    </LtravelLogToolShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-mist/70 p-4">
      <div className="text-graphite/45">{icon}</div>
      <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-graphite/45">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  );
}
