"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpDown, CornerDownLeft, LocateFixed, MapPin, Route } from "lucide-react";
import type { Route as NextRoute } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { chargingPlans, calculateTripEstimate, tunnelOptions } from "@/features/ltravellog/logic";

const sheetInputClass = "w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/35 focus:border-white/45";

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
    <AppShell showHeader={false} showBottomNav={false}>
      <main className="relative min-h-[100svh] overflow-hidden bg-[#e8efee] lg:grid lg:grid-cols-[minmax(360px,38vw)_1fr]">
        <MapSurface />

        <aside className="relative z-10 hidden border-r border-black/[0.05] bg-white lg:flex lg:h-screen lg:flex-col lg:justify-between lg:px-10 lg:py-10">
          <div>
            <Link href={"/ltravellog/categories" as NextRoute} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink" aria-label="Back">
              <ArrowLeft size={19} />
            </Link>
            <div className="mt-16 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-ink">AnotherOne</p>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-graphite/45">Trip Planner</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[5px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.75),transparent_7rem),linear-gradient(135deg,#dfe7dd,#c8d7dd,#d9bca7)] p-8 shadow-[0_18px_48px_rgba(34,34,34,0.08)]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">LtravelLog</p>
              <h1 className="mt-3 text-3xl font-black text-white">Route estimate</h1>
              <p className="mt-4 text-sm font-semibold leading-7 text-white/80">{origin || "Origin"} to {destination || "Destination"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DesktopMetric label="Distance" value={`${estimate.distanceKm.toFixed(1)} km`} />
              <DesktopMetric label="Time" value={`${estimate.durationMin} min`} />
              <DesktopMetric label="Tunnel" value={`HK$${estimate.tunnelFee}`} />
              <DesktopMetric label="EV cost" value={`HK$${estimate.energyCost.toFixed(1)}`} />
            </div>
            <div className="rounded-[28px] bg-ink p-6 text-white shadow-[0_18px_48px_rgba(34,34,34,0.16)]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">Total</p>
              <p className="mt-1 text-4xl font-black">HK${estimate.total.toFixed(1)}</p>
              <p className="mt-3 text-xs font-semibold leading-6 text-white/60">Potential saving HK${estimate.fuelSavings.toFixed(1)} vs fuel car.</p>
            </div>
          </div>

          <div className="h-11" />
        </aside>

        <section className="relative z-10 flex min-h-[100svh] flex-col justify-between px-5 pb-6 pt-6 lg:px-0 lg:py-0">
          <div className="flex items-center justify-between lg:hidden">
            <Link href={"/ltravellog/categories" as NextRoute} className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/45 text-white shadow-[0_12px_28px_rgba(34,34,34,0.08)] backdrop-blur" aria-label="Back">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-black text-ink">LTravelLog</h1>
            <div className="h-14 w-14" />
          </div>

          <div className="hidden lg:block" />

          <PlannerSheet
            origin={origin}
            destination={destination}
            distance={distance}
            duration={duration}
            planId={planId}
            tunnelId={tunnelId}
            avoidTolls={avoidTolls}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onDistanceChange={setDistance}
            onDurationChange={setDuration}
            onPlanChange={setPlanId}
            onTunnelChange={setTunnelId}
            onAvoidTollsChange={setAvoidTolls}
            className="mb-3 lg:absolute lg:bottom-10 lg:left-10 lg:mb-0 lg:w-[360px] xl:w-[400px]"
          />
        </section>
      </main>
    </AppShell>
  );
}

function MapSurface() {
  return (
    <div
      className="absolute inset-0 bg-[#dfe8e6] bg-cover bg-center opacity-90 lg:left-[38vw]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.32),rgba(255,255,255,.32)),url('https://tile.openstreetmap.org/11/1673/859.png')"
      }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.18),rgba(124,139,146,.35))]" />
      <div className="absolute left-[42%] top-[35%] hidden rounded-full bg-white/35 px-4 py-2 text-xs font-black text-white shadow-sm backdrop-blur lg:block">Hong Kong</div>
      <div className="absolute left-6 top-6 hidden h-12 w-12 items-center justify-center rounded-full bg-white/50 text-white backdrop-blur lg:flex">
        <LocateFixed size={20} />
      </div>
    </div>
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
        <SheetField label="出發點" icon={<LocateFixed size={24} />}>
          <input className={sheetInputClass} value={origin} placeholder="輸入地址或使用目前位置" onChange={(event) => onOriginChange(event.target.value)} />
        </SheetField>
        <SheetField label="目的地" icon={<LocateFixed size={24} />}>
          <input className={sheetInputClass} value={destination} placeholder="你想去邊？" onChange={(event) => onDestinationChange(event.target.value)} />
        </SheetField>
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button">
          <MapPin size={20} /> 新增途經點
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button">
          <ArrowUpDown size={20} /> 將起點和目的地對調
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button">
          <CornerDownLeft size={20} /> 加入回程
        </button>
        <div className="grid grid-cols-2 gap-3">
          <SheetField label="距離 km">
            <input className={sheetInputClass} type="number" min="0" step="0.1" value={distance} onChange={(event) => onDistanceChange(Number(event.target.value) || 0)} />
          </SheetField>
          <SheetField label="時間 min">
            <input className={sheetInputClass} type="number" min="0" step="1" value={duration} onChange={(event) => onDurationChange(Number(event.target.value) || 0)} />
          </SheetField>
        </div>
        <SheetField label="能源方案">
          <select className={sheetInputClass} value={planId} onChange={(event) => onPlanChange(event.target.value)}>
            {chargingPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
          </select>
        </SheetField>
        <SheetField label="隧道">
          <select className={sheetInputClass} value={tunnelId} disabled={avoidTolls} onChange={(event) => onTunnelChange(event.target.value)}>
            {tunnelOptions.map((tunnel) => <option key={tunnel.id} value={tunnel.id}>{tunnel.name}</option>)}
          </select>
        </SheetField>
        <label className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white/85">
          避開收費路段
          <input className="h-7 w-7 accent-white" type="checkbox" checked={avoidTolls} onChange={(event) => onAvoidTollsChange(event.target.checked)} />
        </label>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d57783] px-5 py-4 text-lg font-black text-white shadow-[0_16px_32px_rgba(148,67,78,0.28)] transition active:scale-[0.99]" type="button">
          <Route size={20} /> 開始規劃
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

function DesktopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-mist/70 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-graphite/45">{label}</p>
      <p className="mt-2 text-sm font-black text-ink">{value}</p>
    </div>
  );
}
