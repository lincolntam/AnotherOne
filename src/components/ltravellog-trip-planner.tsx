"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, CornerDownLeft, LocateFixed, MapPin, Route } from "lucide-react";
import { LtravelLogFrame } from "@/components/ltravellog-frame";
import { chargingPlans, calculateTripEstimate, tunnelOptions } from "@/features/ltravellog/logic";

const sheetInputClass = "w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/35 focus:border-white/45 disabled:opacity-50";

export function LtravelLogTripPlanner() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState(28);
  const [duration, setDuration] = useState(42);
  const [planId, setPlanId] = useState<string>(chargingPlans[0].id);
  const [tunnelId, setTunnelId] = useState("none");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const estimate = useMemo(
    () => calculateTripEstimate(distance, duration, planId, avoidTolls ? "none" : tunnelId),
    [avoidTolls, distance, duration, planId, tunnelId]
  );

  return (
    <LtravelLogFrame
      activeId="trip-planner"
      mobileTitle="LTravelLog"
      mobileSubtitle="Trip Planner"
      showMap
      right={
        <section className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-6 pt-24 lg:px-0 lg:pb-0 lg:pt-0">
          <div className="pointer-events-none absolute left-8 top-8 hidden rounded-full bg-white/45 px-4 py-2 text-xs font-black text-white shadow-sm backdrop-blur lg:block">
            LTravelLog
          </div>
          <PlannerSheet
            origin={origin}
            destination={destination}
            distance={distance}
            duration={duration}
            planId={planId}
            tunnelId={tunnelId}
            avoidTolls={avoidTolls}
            total={estimate.total}
            tunnelFee={estimate.tunnelFee}
            energyCost={estimate.energyCost}
            fuelSavings={estimate.fuelSavings}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onDistanceChange={setDistance}
            onDurationChange={setDuration}
            onPlanChange={setPlanId}
            onTunnelChange={setTunnelId}
            onAvoidTollsChange={setAvoidTolls}
            className="lg:absolute lg:bottom-10 lg:left-10 lg:w-[360px] xl:w-[400px]"
          />
        </section>
      }
    />
  );
}

function PlannerSheet({
  origin,
  destination,
  distance,
  duration,
  planId,
  tunnelId,
  avoidTolls,
  total,
  tunnelFee,
  energyCost,
  fuelSavings,
  onOriginChange,
  onDestinationChange,
  onDistanceChange,
  onDurationChange,
  onPlanChange,
  onTunnelChange,
  onAvoidTollsChange,
  className
}: {
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  planId: string;
  tunnelId: string;
  avoidTolls: boolean;
  total: number;
  tunnelFee: number;
  energyCost: number;
  fuelSavings: number;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onDistanceChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  onPlanChange: (value: string) => void;
  onTunnelChange: (value: string) => void;
  onAvoidTollsChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <form className={`rounded-[34px] bg-[#6f7679]/88 p-5 text-white shadow-[0_22px_70px_rgba(34,34,34,0.28)] backdrop-blur-xl ${className ?? ""}`}>
      <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-white/20" />
      <div className="space-y-3">
        <SheetField label="Origin" icon={<LocateFixed size={24} />}>
          <input className={sheetInputClass} value={origin} placeholder="Enter address or use current location" onChange={(event) => onOriginChange(event.target.value)} />
        </SheetField>
        <SheetField label="Destination" icon={<LocateFixed size={24} />}>
          <input className={sheetInputClass} value={destination} placeholder="Where do you want to go?" onChange={(event) => onDestinationChange(event.target.value)} />
        </SheetField>
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button">
          <MapPin size={20} /> Add waypoint
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button">
          <ArrowUpDown size={20} /> Swap origin and destination
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button">
          <CornerDownLeft size={20} /> Add return trip
        </button>
        <div className="grid grid-cols-2 gap-3">
          <SheetField label="Distance km">
            <input className={sheetInputClass} type="number" min="0" step="0.1" value={distance} onChange={(event) => onDistanceChange(Number(event.target.value) || 0)} />
          </SheetField>
          <SheetField label="Time min">
            <input className={sheetInputClass} type="number" min="0" step="1" value={duration} onChange={(event) => onDurationChange(Number(event.target.value) || 0)} />
          </SheetField>
        </div>
        <SheetField label="Energy plan">
          <select className={sheetInputClass} value={planId} onChange={(event) => onPlanChange(event.target.value)}>
            {chargingPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
          </select>
        </SheetField>
        <SheetField label="Tunnel">
          <select className={sheetInputClass} value={tunnelId} disabled={avoidTolls} onChange={(event) => onTunnelChange(event.target.value)}>
            {tunnelOptions.map((tunnel) => <option key={tunnel.id} value={tunnel.id}>{tunnel.name}</option>)}
          </select>
        </SheetField>
        <label className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white/85">
          Avoid toll roads
          <input className="h-7 w-7 accent-white" type="checkbox" checked={avoidTolls} onChange={(event) => onAvoidTollsChange(event.target.checked)} />
        </label>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-[0.08em] text-white/70">
          <Metric label="Tunnel" value={`HK$${tunnelFee}`} />
          <Metric label="EV" value={`HK$${energyCost.toFixed(1)}`} />
          <Metric label="Save" value={`HK$${fuelSavings.toFixed(1)}`} />
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d57783] px-5 py-4 text-lg font-black text-white shadow-[0_16px_32px_rgba(148,67,78,0.28)] transition active:scale-[0.99]" type="button">
          <Route size={20} /> Start planning HK${total.toFixed(1)}
        </button>
      </div>
      <p className="mt-5 text-center text-xs font-bold text-white/35">v0.55.14</p>
    </form>
  );
}

function SheetField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-white/70">
      {label}
      <div className="relative mt-1">
        {children}
        {icon ? <span className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white/70">{icon}</span> : null}
      </div>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-2 py-2">
      <p>{label}</p>
      <p className="mt-1 text-sm tracking-normal text-white">{value}</p>
    </div>
  );
}
