"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, CalendarDays, Car, CornerDownLeft, LocateFixed, MapPin, Route, Zap } from "lucide-react";
import { LtravelLogFrame } from "@/components/ltravellog-frame";
import {
  calculateTripEstimate,
  calculateTripEstimateWithToll,
  chargingPlans,
  detectRouteTunnels,
  type LatLngPoint,
  type RouteTunnelDetail,
  type TripEstimate
} from "@/features/ltravellog/logic";

type GoogleMaps = {
  maps?: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
    DirectionsRenderer: new (options: Record<string, unknown>) => DirectionsRendererInstance;
    DirectionsService: new () => DirectionsServiceInstance;
    TravelMode: { DRIVING: string };
    places: {
      Autocomplete: new (input: HTMLInputElement, options: Record<string, unknown>) => unknown;
    };
  };
};

type GoogleMapInstance = object;

type DirectionsRendererInstance = {
  setDirections: (result: DirectionsResult) => void;
};

type DirectionsServiceInstance = {
  route: (request: DirectionsRequest, callback: (result: DirectionsResult | null, status: string) => void) => void;
};

type DirectionsRequest = {
  origin: string;
  destination: string;
  waypoints: Array<{ location: string; stopover: boolean }>;
  travelMode: string;
  avoidTolls: boolean;
};

type DirectionsResult = {
  routes?: Array<{
    legs?: Array<{
      distance?: { value?: number };
      duration?: { value?: number };
    }>;
    overview_path?: Array<{ lat: () => number; lng: () => number }>;
  }>;
};

declare global {
  interface Window {
    google?: GoogleMaps;
    gm_authFailure?: () => void;
  }
}

const sheetInputClass = "w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/35 focus:border-white/45 disabled:opacity-50";

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LtravelLogTripPlanner() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const originInputRef = useRef<HTMLInputElement | null>(null);
  const destinationInputRef = useRef<HTMLInputElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const directionsServiceRef = useRef<DirectionsServiceInstance | null>(null);
  const directionsRendererRef = useRef<DirectionsRendererInstance | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [returnTrip, setReturnTrip] = useState(false);
  const [distance, setDistance] = useState(28);
  const [duration, setDuration] = useState(42);
  const [startTime, setStartTime] = useState(() => toLocalInputValue(new Date()));
  const [planId, setPlanId] = useState<string>(chargingPlans[0].id);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [routeDetails, setRouteDetails] = useState<RouteTunnelDetail[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [routeMessage, setRouteMessage] = useState("Ready");

  const manualEstimate = useMemo(
    () => calculateTripEstimate(distance, duration, planId, "none"),
    [distance, duration, planId]
  );

  const routeEstimate = useMemo(() => {
    if (!routeDetails.length) return manualEstimate;
    const tollFee = routeDetails.reduce((sum, detail) => sum + detail.fee, 0);
    const tollRule = routeDetails.map((detail) => `${detail.name}: ${detail.rule}`).join(" + ");
    return calculateTripEstimateWithToll(distance, duration, planId, avoidTolls ? 0 : tollFee, avoidTolls ? "Avoid toll roads" : tollRule);
  }, [avoidTolls, distance, duration, manualEstimate, planId, routeDetails]);

  useEffect(() => {
    let cancelled = false;

    async function loadGoogleMaps() {
      try {
        const response = await fetch("/api/config");
        const config = await response.json() as { Maps_API_KEY?: string };
        const key = config.Maps_API_KEY;
        if (!key) {
          setMapError("Google Maps API key is not configured. Manual estimate is available.");
          return;
        }

        window.gm_authFailure = () => {
          setMapError("Google Maps API key is not allowed for this domain.");
          setMapsReady(false);
        };

        if (window.google?.maps) {
          if (!cancelled) setupGoogleMap();
          return;
        }

        const existing = document.getElementById("google-maps-script") as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => !cancelled && setupGoogleMap(), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&language=zh-HK&region=HK&v=weekly&loading=async&auth_referrer_policy=origin`;
        script.async = true;
        script.onload = () => !cancelled && setupGoogleMap();
        script.onerror = () => !cancelled && setMapError("Google Maps script failed to load.");
        document.head.appendChild(script);
      } catch {
        if (!cancelled) setMapError("Google Maps config is unavailable. Manual estimate is available.");
      }
    }

    function setupGoogleMap() {
      if (!mapRef.current || !window.google?.maps || mapInstanceRef.current) return;
      const maps = window.google.maps;
      const map = new maps.Map(mapRef.current, {
        center: { lat: 22.3193, lng: 114.1694 },
        zoom: 11,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { elementType: "geometry", stylers: [{ saturation: -35 }, { lightness: 18 }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8f9698" }] }
        ]
      });
      const renderer = new maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: { strokeColor: "#d57783", strokeOpacity: 0.86, strokeWeight: 6 }
      });
      mapInstanceRef.current = map;
      directionsServiceRef.current = new maps.DirectionsService();
      directionsRendererRef.current = renderer;

      if (originInputRef.current) {
        new maps.places.Autocomplete(originInputRef.current, { componentRestrictions: { country: "hk" } });
      }
      if (destinationInputRef.current) {
        new maps.places.Autocomplete(destinationInputRef.current, { componentRestrictions: { country: "hk" } });
      }

      setMapsReady(true);
      setMapError("");
    }

    loadGoogleMaps();
    return () => {
      cancelled = true;
    };
  }, []);

  async function planRoute() {
    if (!mapsReady || !window.google?.maps || !directionsServiceRef.current || !origin || !destination) {
      setRouteMessage(mapsReady ? "請輸入出發點和目的地。" : "Map 未能載入，請檢查 Google Maps API key。");
      setRouteDetails([]);
      return;
    }

    setIsPlanning(true);
    setRouteMessage("Planning route...");
    const maps = window.google.maps;
    const routeDestination = returnTrip ? origin : destination;
    const selectedWaypoints = [
      ...waypoints.filter(Boolean),
      ...(returnTrip ? [destination].filter(Boolean) : [])
    ].map((location) => ({ location, stopover: true }));

    directionsServiceRef.current.route(
      {
        origin,
        destination: routeDestination,
        waypoints: selectedWaypoints,
        travelMode: maps.TravelMode.DRIVING,
        avoidTolls
      },
      (result: DirectionsResult | null, status: string) => {
        setIsPlanning(false);
        if (status !== "OK" || !result?.routes?.[0]) {
          setRouteMessage(status === "NOT_FOUND" || status === "ZERO_RESULTS" ? "找不到路線，請輸入完整地址。" : `Route failed: ${status}`);
          return;
        }

        directionsRendererRef.current?.setDirections(result);
        const route = result.routes[0];
        const legs = route.legs ?? [];
        const nextDistance = legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0) / 1000;
        const nextDuration = Math.round(legs.reduce((sum, leg) => sum + (leg.duration?.value ?? 0), 0) / 60);
        const path: LatLngPoint[] = (route.overview_path ?? []).map((point) => ({ lat: point.lat(), lng: point.lng() }));
        const autoDetected = avoidTolls ? [] : detectRouteTunnels(path);

        setDistance(Number(nextDistance.toFixed(1)));
        setDuration(nextDuration);
        setRouteDetails(autoDetected);
        setRouteMessage(autoDetected.length ? "Route planned with tunnel fee." : "Route planned.");
      }
    );
  }

  function useCurrentLocation(target: "origin" | "destination") {
    if (!navigator.geolocation) {
      setRouteMessage("Current location is not supported.");
      return;
    }

    setRouteMessage("Getting current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const value = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
        if (target === "origin") setOrigin(value);
        if (target === "destination") setDestination(value);
        setRouteMessage("Current location added.");
      },
      () => setRouteMessage("Unable to get current location."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <LtravelLogFrame
      activeId="trip-planner"
      mobileTitle="LTravelLog"
      mobileSubtitle="Trip Planner"
      right={
        <section className="relative flex h-full min-h-0 flex-col justify-end overflow-hidden bg-[#dfe8e6] px-4 pb-4 pt-0 lg:px-0 lg:pb-0 lg:pt-0">
          <div ref={mapRef} className="absolute inset-0" />
          {!mapsReady ? <FallbackMap /> : null}
          <div className="pointer-events-none absolute left-8 top-8 hidden rounded-full bg-white/45 px-4 py-2 text-xs font-black text-white shadow-sm backdrop-blur lg:block">
            LTravelLog
          </div>
          <PlannerSheet
            origin={origin}
            destination={destination}
            waypoints={waypoints}
            returnTrip={returnTrip}
            distance={distance}
            duration={duration}
            startTime={startTime}
            planId={planId}
            avoidTolls={avoidTolls}
            estimate={routeEstimate}
            routeDetails={routeDetails}
            mapsReady={mapsReady}
            mapError={mapError}
            routeMessage={routeMessage}
            isPlanning={isPlanning}
            originInputRef={originInputRef}
            destinationInputRef={destinationInputRef}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onWaypointsChange={setWaypoints}
            onReturnTripChange={setReturnTrip}
            onStartTimeChange={setStartTime}
            onPlanChange={setPlanId}
            onAvoidTollsChange={setAvoidTolls}
            onUseCurrentLocation={useCurrentLocation}
            onPlan={planRoute}
            className="relative z-10 lg:absolute lg:bottom-10 lg:left-10 lg:w-[360px] xl:w-[400px]"
          />
        </section>
      }
      hideMobileHeader
    />
  );
}

function FallbackMap() {
  return (
    <div
      className="absolute inset-0 bg-[#dfe8e6] bg-cover bg-center opacity-90"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.34),rgba(255,255,255,.34)),url('https://tile.openstreetmap.org/11/1673/859.png')"
      }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(124,139,146,.34))]" />
    </div>
  );
}

function PlannerSheet({
  origin,
  destination,
  waypoints,
  returnTrip,
  distance,
  duration,
  startTime,
  planId,
  avoidTolls,
  estimate,
  routeDetails,
  mapsReady,
  mapError,
  routeMessage,
  isPlanning,
  originInputRef,
  destinationInputRef,
  onOriginChange,
  onDestinationChange,
  onWaypointsChange,
  onReturnTripChange,
  onStartTimeChange,
  onPlanChange,
  onAvoidTollsChange,
  onUseCurrentLocation,
  onPlan,
  className
}: {
  origin: string;
  destination: string;
  waypoints: string[];
  returnTrip: boolean;
  distance: number;
  duration: number;
  startTime: string;
  planId: string;
  avoidTolls: boolean;
  estimate: TripEstimate;
  routeDetails: RouteTunnelDetail[];
  mapsReady: boolean;
  mapError: string;
  routeMessage: string;
  isPlanning: boolean;
  originInputRef: React.RefObject<HTMLInputElement | null>;
  destinationInputRef: React.RefObject<HTMLInputElement | null>;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onWaypointsChange: (value: string[]) => void;
  onReturnTripChange: (value: boolean) => void;
  onStartTimeChange: (value: string) => void;
  onPlanChange: (value: string) => void;
  onAvoidTollsChange: (value: boolean) => void;
  onUseCurrentLocation: (target: "origin" | "destination") => void;
  onPlan: () => void;
  className?: string;
}) {
  return (
    <form className={`rounded-[24px] bg-[#6f7679]/88 p-5 text-white shadow-[0_22px_70px_rgba(34,34,34,0.28)] backdrop-blur-xl sm:rounded-[34px] ${className ?? ""}`} onSubmit={(event) => { event.preventDefault(); onPlan(); }}>
      <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-white/20" />
      <div className="space-y-3">
        <SheetField label="出發點" icon={<button type="button" aria-label="Use current location for origin" onClick={() => onUseCurrentLocation("origin")}><LocateFixed size={24} /></button>}>
          <input ref={originInputRef} className={sheetInputClass} value={origin} placeholder="輸入地址或使用目前位置" onChange={(event) => onOriginChange(event.target.value)} />
        </SheetField>
        <SheetField label="目的地" icon={<button type="button" aria-label="Use current location for destination" onClick={() => onUseCurrentLocation("destination")}><LocateFixed size={24} /></button>}>
          <input ref={destinationInputRef} className={sheetInputClass} value={destination} placeholder="你想去邊？" onChange={(event) => onDestinationChange(event.target.value)} />
        </SheetField>
        {waypoints.map((waypoint, index) => (
          <SheetField key={index} label={`途經點 ${index + 1}`}>
            <input
              className={sheetInputClass}
              value={waypoint}
              placeholder="輸入途經點"
              onChange={(event) => onWaypointsChange(waypoints.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
            />
          </SheetField>
        ))}
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button" onClick={() => onWaypointsChange([...waypoints, ""])}>
          <MapPin size={20} /> 新增途經點
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base font-black text-white transition active:scale-[0.99]" type="button" onClick={() => { onOriginChange(destination); onDestinationChange(origin); }}>
          <ArrowUpDown size={20} /> 將起點和目的地對調
        </button>
        <button className={`flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 px-4 py-3 text-base font-black text-white transition active:scale-[0.99] ${returnTrip ? "bg-white/20" : "bg-white/10"}`} type="button" onClick={() => onReturnTripChange(!returnTrip)}>
          <CornerDownLeft size={20} /> {returnTrip ? "已加入回程" : "加入回程"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <SheetField label="出發時間" icon={<CalendarDays size={19} />}>
            <input className={sheetInputClass} type="datetime-local" value={startTime} onChange={(event) => onStartTimeChange(event.target.value)} />
          </SheetField>
          <SheetField label="能源方案">
            <select className={sheetInputClass} value={planId} onChange={(event) => onPlanChange(event.target.value)}>
              {chargingPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
            </select>
          </SheetField>
        </div>
        <label className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white/85">
          避開收費路段
          <input className="h-7 w-7 accent-white" type="checkbox" checked={avoidTolls} onChange={(event) => onAvoidTollsChange(event.target.checked)} />
        </label>
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold leading-5 text-white/70">
          <p>{mapsReady ? routeMessage : mapError || "Loading Google Maps..."}</p>
          {routeDetails.length ? <p className="mt-1">{routeDetails.map((detail) => `${detail.name} HK$${detail.fee}`).join(" + ")}</p> : null}
        </div>
        {routeMessage.startsWith("Route planned") || routeDetails.length ? <RouteSummary estimate={estimate} routeDetails={routeDetails} distance={distance} duration={duration} /> : null}
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d57783] px-5 py-4 text-lg font-black text-white shadow-[0_16px_32px_rgba(148,67,78,0.28)] transition active:scale-[0.99]" type="submit" disabled={isPlanning}>
          <Route size={20} /> {isPlanning ? "規劃中..." : "開始規劃"}
        </button>
      </div>
      <p className="mt-5 text-center text-xs font-bold text-white/35">v0.55.21</p>
    </form>
  );
}

function RouteSummary({ estimate, routeDetails, distance, duration }: { estimate: TripEstimate; routeDetails: RouteTunnelDetail[]; distance: number; duration: number }) {
  return (
    <section className="rounded-3xl border border-white/15 bg-black/[0.16] p-4 text-white">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Route estimate</p>
          <p className="mt-1 text-xl font-black">HK${estimate.total.toFixed(1)}</p>
        </div>
        <p className="text-right text-xs font-bold text-white/55">{distance.toFixed(1)} km / {duration} min</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <RouteMetric icon={<Route size={15} />} label="Tunnel" value={`HK$${estimate.tunnelFee}`} />
        <RouteMetric icon={<Zap size={15} />} label="EV" value={`HK$${estimate.energyCost.toFixed(1)}`} />
        <RouteMetric icon={<Car size={15} />} label="Fuel car" value={`HK$${estimate.fuelCarCost.toFixed(1)}`} />
        <RouteMetric icon={<Zap size={15} />} label="Save" value={`HK$${estimate.fuelSavings.toFixed(1)}`} />
      </div>
      <p className="mt-3 line-clamp-2 text-[11px] font-bold leading-5 text-white/52">
        {routeDetails.length ? routeDetails.map((detail) => `${detail.name} HK$${detail.fee}`).join(" + ") : estimate.tollRule}
      </p>
    </section>
  );
}

function RouteMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
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
