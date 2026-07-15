export const FUEL_CAR_COST_PER_KM = 2.25;

export const chargingPlans = [
  { id: "home-off-peak", label: "家用電 非繁忙時段", efficiency: 0.16, rate: 1.343 },
  { id: "home-peak", label: "家用電 繁忙時段", efficiency: 0.16, rate: 1.773 },
  { id: "tesla-supercharge", label: "Tesla 超級充電", efficiency: 0.16, rate: 2.43 }
] as const;

export const fixedTunnels = [
  { id: "aberdeen", name: "香港仔隧道", fee: 8, rule: "固定收費" },
  { id: "shing-mun", name: "城門隧道", fee: 8, rule: "固定收費" },
  { id: "lion-rock", name: "獅子山隧道", fee: 8, rule: "固定收費" },
  { id: "eagles-nest", name: "尖山／沙田嶺／大圍隧道", fee: 8, rule: "固定收費" },
  { id: "tates-cairn", name: "大老山隧道", fee: 20, rule: "固定收費" },
  { id: "discovery-bay", name: "愉景灣隧道連接路", fee: 250, rule: "前往愉景灣單程" }
] as const;

export const tunnelOptions = [
  { id: "auto", name: "自動偵測", kind: "auto", fee: 0 },
  { id: "none", name: "不使用隧道", kind: "fixed", fee: 0 },
  { id: "western", name: "西區海底隧道", kind: "harbour" },
  { id: "cross-harbour", name: "海底隧道", kind: "harbour" },
  { id: "eastern", name: "東區海底隧道", kind: "harbour" },
  { id: "tai-lam", name: "大欖隧道", kind: "tai-lam" },
  ...fixedTunnels.map((tunnel) => ({ id: tunnel.id, name: tunnel.name, kind: "fixed", fee: tunnel.fee }))
] as const;

export const zoneOneChargingSlots = [
  { startDay: 1, startTime: "00:00", endDay: 1, endTime: "11:59", label: "星期一 00:00 至 11:59（特別時段）" },
  { startDay: 2, startTime: "12:00", endDay: 3, endTime: "11:59", label: "星期二 12:00 至星期三 11:59" },
  { startDay: 4, startTime: "12:00", endDay: 5, endTime: "11:59", label: "星期四 12:00 至星期五 11:59" },
  { startDay: 6, startTime: "12:00", endDay: 0, endTime: "11:59", label: "星期六 12:00 至星期日 11:59" }
] as const;

export type LatLngPoint = {
  lat: number;
  lng: number;
};

export type TollResult = {
  fee: number;
  rule: string;
};

export type RouteTunnelDetail = TollResult & {
  id: string;
  name: string;
};

export type TripEstimate = {
  distanceKm: number;
  durationMin: number;
  tunnelFee: number;
  energyCost: number;
  total: number;
  fuelCarCost: number;
  fuelSavings: number;
  tollRule: string;
};

const hkGeneralHolidays2026 = new Set([
  "2026-01-01", "2026-02-17", "2026-02-18", "2026-02-19", "2026-04-03",
  "2026-04-04", "2026-04-06", "2026-04-07", "2026-05-01", "2026-05-25",
  "2026-06-19", "2026-07-01", "2026-09-26", "2026-10-01", "2026-10-19",
  "2026-12-25", "2026-12-26"
]);

const routeTunnelDetectors = [
  { id: "western", name: "西區海底隧道", points: [{ lat: 22.297361, lng: 114.153278 }, { lat: 22.297139, lng: 114.152917 }], radius: 520 },
  { id: "cross-harbour", name: "海底隧道", points: [{ lat: 22.289806, lng: 114.182389 }, { lat: 22.29, lng: 114.182222 }], radius: 520 },
  { id: "eastern", name: "東區海底隧道", points: [{ lat: 22.296139, lng: 114.224833 }, { lat: 22.295944, lng: 114.224222 }], radius: 520 },
  { id: "tai-lam", name: "大欖隧道", points: [{ lat: 22.387111, lng: 114.062722 }], radius: 520 },
  { id: "lion-rock", name: "獅子山隧道", points: [{ lat: 22.351611, lng: 114.177389 }, { lat: 22.351194, lng: 114.177056 }], radius: 420 },
  { id: "tates-cairn", name: "大老山隧道", points: [{ lat: 22.358444, lng: 114.210583 }, { lat: 22.359, lng: 114.210333 }], radius: 420 },
  { id: "eagles-nest", name: "尖山／沙田嶺／大圍隧道", points: [{ lat: 22.351722, lng: 114.158889 }, { lat: 22.351611, lng: 114.158222 }], radius: 120 },
  { id: "shing-mun", name: "城門隧道", points: [{ lat: 22.37625, lng: 114.150528 }, { lat: 22.376611, lng: 114.150361 }], radius: 420 }
];

const weekMs = 7 * 24 * 60 * 60 * 1000;

export function calculateTripEstimate(distanceKm: number, durationMin: number, planId: string, tunnelId: string, at = new Date()): TripEstimate {
  const toll = getTunnelFee(tunnelId, at);
  return buildTripEstimate(distanceKm, durationMin, planId, toll.fee, toll.rule);
}

export function calculateTripEstimateWithToll(distanceKm: number, durationMin: number, planId: string, tunnelFee: number, tollRule: string): TripEstimate {
  return buildTripEstimate(distanceKm, durationMin, planId, tunnelFee, tollRule);
}

export function getTunnelFee(tunnelId: string, date = new Date()): TollResult {
  const tunnel = tunnelOptions.find((item) => item.id === tunnelId) ?? tunnelOptions[0];
  if (tunnel.kind === "harbour") return harbourFee(tunnel.id, date);
  if (tunnel.kind === "tai-lam") return taiLamFee(date);
  return { fee: "fee" in tunnel ? tunnel.fee : 0, rule: tunnel.id === "none" ? "未選擇隧道" : "固定收費" };
}

export function getCurrentTunnelFees(date = new Date()) {
  return [
    { name: "西區海底隧道", ...harbourFee("western", date) },
    { name: "海底隧道", ...harbourFee("cross-harbour", date) },
    { name: "東區海底隧道", ...harbourFee("eastern", date) },
    { name: "大欖隧道", ...taiLamFee(date) },
    ...fixedTunnels.map((item) => ({ name: item.name, fee: item.fee, rule: item.rule }))
  ];
}

export function detectRouteTunnels(points: LatLngPoint[], date = new Date()): RouteTunnelDetail[] {
  const detected = routeTunnelDetectors.filter((tunnel) =>
    tunnel.points.some((gate) => points.some((point) => distanceMeters(point, gate) <= tunnel.radius))
  );

  return detected.map((tunnel) => {
    const toll = getTunnelFee(tunnel.id, date);
    return { id: tunnel.id, name: tunnel.name, ...toll };
  });
}

export function describeChargingSlot(now = new Date()) {
  const slots = buildSlotOccurrences(now);
  const activeSlot = slots.find((slot) => slot.start <= now && now <= slot.end);

  if (activeSlot) {
    return {
      active: true,
      title: "現正供電",
      body: `Zone 1 將供電至 ${formatDateTime(activeSlot.end)}。`,
      meta: activeSlot.label
    };
  }

  const nextSlot = slots.find((slot) => slot.start > now) ?? slots[0];
  return {
    active: false,
    title: "下一個充電時段",
    body: `${formatDateTime(nextSlot.start)} to ${formatDateTime(nextSlot.end)}`,
    meta: nextSlot.label
  };
}

export function getRangeCoverage(start: Date, end: Date) {
  const slots = buildSlotOccurrences(start);
  const overlappingSlots = slots.filter((slot) => slot.end >= start && slot.start <= end);
  const fullyCovered = overlappingSlots.some((slot) => slot.start <= start && slot.end >= end);
  const nextSlot = slots.find((slot) => slot.start > start);
  return { fullyCovered, overlappingSlots, nextSlot };
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("zh-HK", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function buildTripEstimate(distanceKm: number, durationMin: number, planId: string, tunnelFee: number, tollRule: string): TripEstimate {
  const plan = chargingPlans.find((item) => item.id === planId) ?? chargingPlans[0];
  const energyCost = distanceKm * plan.efficiency * plan.rate;
  const total = energyCost + tunnelFee;
  const fuelCarCost = distanceKm * FUEL_CAR_COST_PER_KM + tunnelFee;

  return {
    distanceKm,
    durationMin,
    tunnelFee,
    energyCost,
    total,
    fuelCarCost,
    fuelSavings: Math.max(0, fuelCarCost - total),
    tollRule
  };
}

function buildSlotOccurrences(now: Date) {
  const weekStart = getWeekStart(now);
  return zoneOneChargingSlots
    .flatMap((slot) => [-1, 0, 1, 2].map((weekOffset) => {
      const start = applyDayAndTime(weekStart, slot.startDay, slot.startTime, weekOffset);
      const end = applyDayAndTime(weekStart, slot.endDay, slot.endTime, weekOffset);
      if (end < start) end.setTime(end.getTime() + weekMs);
      return { ...slot, start, end };
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart;
}

function applyDayAndTime(weekStart: Date, day: number, time: string, weekOffset: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const slotTime = new Date(weekStart.getTime() + weekOffset * weekMs);
  slotTime.setDate(slotTime.getDate() + day);
  slotTime.setHours(hours, minutes, 0, 0);
  return slotTime;
}

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSundayOrHoliday(date: Date) {
  return date.getDay() === 0 || hkGeneralHolidays2026.has(dateKey(date));
}

function transition(minutes: number, start: number, first: number, step: number, stepMinutes = 2) {
  return first + Math.floor(Math.max(0, minutes - start) / stepMinutes) * step;
}

function harbourFee(tunnelId: string, date: Date): TollResult {
  const m = minutesOfDay(date);
  const west = tunnelId === "western";
  if (isSundayOrHoliday(date)) {
    if (m <= 610) return { fee: 20, rule: "假日非繁忙時段" };
    if (m <= 614) return { fee: transition(m, 611, 21, 2), rule: "假日過渡時段" };
    if (m <= 1154) return { fee: 25, rule: "假日標準時段" };
    if (m <= 1158) return { fee: transition(m, 1155, 23, -2), rule: "假日過渡時段" };
    return { fee: 20, rule: "假日非繁忙時段" };
  }
  if (m <= 449) return { fee: 20, rule: "非繁忙時段" };
  if (west && m <= 487) return { fee: transition(m, 450, 22, 2), rule: "早上過渡時段" };
  if (!west && m <= 467) return { fee: transition(m, 450, 22, 2), rule: "早上過渡時段" };
  if (west && m <= 614) return { fee: 60, rule: "早上繁忙時段" };
  if (!west && m <= 614) return { fee: 40, rule: "早上繁忙時段" };
  if (west && m <= 642) return { fee: transition(m, 615, 58, -2), rule: "日間過渡時段" };
  if (!west && m <= 622) return { fee: transition(m, 615, 38, -2), rule: "日間過渡時段" };
  if (m <= 989) return { fee: 30, rule: "標準時段" };
  if (west && m <= 1017) return { fee: transition(m, 990, 32, 2), rule: "傍晚過渡時段" };
  if (!west && m <= 997) return { fee: transition(m, 990, 32, 2), rule: "傍晚過渡時段" };
  if (west && m <= 1139) return { fee: 60, rule: "傍晚繁忙時段" };
  if (!west && m <= 1139) return { fee: 40, rule: "傍晚繁忙時段" };
  if (west && m <= 1177) return { fee: transition(m, 1140, 58, -2), rule: "晚間過渡時段" };
  if (!west && m <= 1157) return { fee: transition(m, 1140, 38, -2), rule: "晚間過渡時段" };
  return { fee: 20, rule: "非繁忙時段" };
}

function taiLamFee(date: Date): TollResult {
  const m = minutesOfDay(date);
  if (isSundayOrHoliday(date)) return { fee: 18, rule: "假日固定收費" };
  if (m <= 434) return { fee: 18, rule: "非繁忙時段" };
  if (m <= 460) return { fee: transition(m, 435, 19, 2), rule: "早上過渡時段" };
  if (m <= 584) return { fee: 45, rule: "早上繁忙時段" };
  if (m <= 598) return { fee: transition(m, 585, 43, -2), rule: "日間過渡時段" };
  if (m <= 1034) return { fee: 30, rule: "標準時段" };
  if (m <= 1048) return { fee: transition(m, 1035, 31, 2), rule: "傍晚過渡時段" };
  if (m <= 1139) return { fee: 45, rule: "傍晚繁忙時段" };
  if (m <= 1165) return { fee: transition(m, 1140, 43, -2), rule: "晚間過渡時段" };
  return { fee: 18, rule: "非繁忙時段" };
}

function distanceMeters(a: LatLngPoint, b: LatLngPoint) {
  const radius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}
